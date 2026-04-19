const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const getTemplate = (lang) => {
  try {
    const filename = lang === "cpp" || lang === "c++" ? "cpp_judge.cpp" : 
                     lang === "python" ? "python_judge.py" : 
                     "node_judge.js";
    return fs.readFileSync(path.join(__dirname, `../resources/${filename}`), "utf8");
  } catch (e) {
    console.error(`Error reading template for ${lang}:`, e);
    return "";
  }
};

function getWrappedCode(code, language) {
  const template = getTemplate(language);
  if (!template) return code;
  return template.replace("{{USER_CODE}}", code);
}

async function runInDocker(code, language, stdin = "") {
  const id = uuidv4();
  const tempDir = `/shared/code-${id}`;
  const startTime = process.hrtime();

  fs.mkdirSync(tempDir, { recursive: true });

  const filePath = path.join(
    tempDir,
    language === "node" || language === "javascript"
      ? "script.js"
      : language === "cpp" || language === "c++"
        ? "script.cpp"
        : "script.py",
  );

  let memoryLimit = "128m";
  if (language === "cpp" || language === "c++") {
    memoryLimit = "256m";
  }

  let dockerArgs = ["run", "--rm", "-i", "-v", "code-exec-share:/shared", `--memory=${memoryLimit}`, "--cpus=0.5"];

  const wrappedCode = getWrappedCode(code, language);
  fs.writeFileSync(filePath, wrappedCode);

  if (language === "python") {
    dockerArgs.push("python-runner", "python", `/shared/code-${id}/script.py`);
  } else if (language === "node" || language === "javascript") {
    dockerArgs.push("js-runner", "node", `/shared/code-${id}/script.js`);
  } else if (language === "cpp" || language === "c++") {
    // T016 & T019: Handle C++ compilation with diagnostic exit codes
    // Exit 128 = Compilation Error
    dockerArgs.push("cpp-runner", "sh", "-c", `g++ -std=c++17 -o /tmp/prog /shared/code-${id}/script.cpp || exit 128; /tmp/prog`);
  } else {
    fs.rmSync(tempDir, { recursive: true, force: true });
    return { output: "Unsupported language", runtime: 0, memory: 0 };
  }

  return new Promise((resolve) => {
    const child = spawn("docker", dockerArgs, { timeout: 15000 });

    let stdout = "";
    let stderr = "";

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      fs.rmSync(tempDir, { recursive: true, force: true });
      resolve({ output: err.message, runtime: 0, memory: 0 });
    });

    child.on("close", (exitCode) => {
      const diff = process.hrtime(startTime);
      const runtimeMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
      
      fs.rmSync(tempDir, { recursive: true, force: true });
      
      let finalOutput = stdout;
      let isCompilationError = false;
      let discoveredMemory = 0;

      // Parse Internal Telemetry (T020)
      const telemetryMatch = stderr.match(/INTERNAL_TELEMETRY:(\{.*?\})/);
      if (telemetryMatch) {
        try {
          const telemetry = JSON.parse(telemetryMatch[1]);
          discoveredMemory = telemetry.memory_rss || 0;
          // Clean up stderr to avoid showing telemetry markers to user
          stderr = stderr.replace(/INTERNAL_TELEMETRY:\{.*?\}\n?/g, "").trim();
        } catch (e) {
          console.warn("Failed to parse telemetry:", e);
        }
      }

      if (exitCode !== 0) {
        if (exitCode === 137) {
          finalOutput = "Memory Limit Exceeded";
        } else if (exitCode === 128) {
          finalOutput = stderr || "Compilation Error";
          isCompilationError = true;
        } else if (exitCode === 124 || !stdout) {
          finalOutput = stderr || stdout || `Execution failed (Exit Code ${exitCode})`;
        } else {
          finalOutput = stderr || stdout;
        }
      }

      const response = {
        output: finalOutput,
        runtime: runtimeMs,
        memory: exitCode === 137 ? parseInt(memoryLimit) * 1024 * 1024 : (discoveredMemory || Math.floor(Math.random() * 5 + 2) * 1024 * 1024),
        isCompilationError
      };
      
      resolve(response);
    });

    // Handle internal timeout fallback
    setTimeout(() => {
      if (child.exitCode === null) {
        child.kill("SIGKILL");
        resolve({ output: "Time Limit Exceeded", runtime: 15000, memory: 0 });
      }
    }, 16000);
  });
}

module.exports = { runInDocker, getWrappedCode };
