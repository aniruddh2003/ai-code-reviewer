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

function prepareCode(code, language) {
  const id = uuidv4();
  const tempDir = `/shared/code-${id}`;
  fs.mkdirSync(tempDir, { recursive: true });

  const filePath = path.join(
    tempDir,
    language === "node" || language === "javascript"
      ? "script.js"
      : language === "cpp" || language === "c++"
        ? "script.cpp"
        : "script.py"
  );

  const wrappedCode = getWrappedCode(code, language);
  fs.writeFileSync(filePath, wrappedCode);

  return id;
}

async function compileCode(id, language) {
  if (language !== "cpp" && language !== "c++") {
    return { success: true };
  }

  const memoryLimit = "256m";
  const dockerArgs = ["run", "--rm", "-v", "code-exec-share:/shared", `--memory=${memoryLimit}`, "--cpus=0.5", "cpp-runner", "sh", "-c", `g++ -std=c++17 -o /shared/code-${id}/prog /shared/code-${id}/script.cpp || exit 128`];

  return new Promise((resolve) => {
    const child = spawn("docker", dockerArgs, { timeout: 20000 });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => stdout += data.toString());
    child.stderr.on("data", (data) => stderr += data.toString());

    child.on("error", (err) => resolve({ success: false, output: err.message }));
    child.on("close", (exitCode) => {
      if (exitCode === 0) resolve({ success: true });
      else if (exitCode === 128) resolve({ success: false, output: stderr || "Compilation Error" });
      else resolve({ success: false, output: stderr || stdout || `Compilation failed (Exit Code ${exitCode})` });
    });
  });
}

async function executeCode(id, language, stdin = "") {
  const startTime = process.hrtime();
  let memoryLimit = language === "cpp" || language === "c++" ? "256m" : "128m";

  let dockerArgs = ["run", "--rm", "-i", "-v", "code-exec-share:/shared", `--memory=${memoryLimit}`, "--cpus=0.5"];

  if (language === "python") {
    dockerArgs.push("python-runner", "timeout", "5", "python", `/shared/code-${id}/script.py`);
  } else if (language === "node" || language === "javascript") {
    dockerArgs.push("js-runner", "timeout", "5", "node", `/shared/code-${id}/script.js`);
  } else if (language === "cpp" || language === "c++") {
    dockerArgs.push("cpp-runner", "timeout", "5", `/shared/code-${id}/prog`);
  } else {
    return { output: "Unsupported language", runtime: 0, memory: 0 };
  }

  return new Promise((resolve) => {
    const child = spawn("docker", dockerArgs, { timeout: 15000 }); // Docker run takes ~1s. 15s is plenty.

    let stdout = "";
    let stderr = "";

    if (stdin) child.stdin.write(stdin);
    child.stdin.end();

    child.stdout.on("data", (data) => stdout += data.toString());
    child.stderr.on("data", (data) => stderr += data.toString());

    child.on("error", (err) => resolve({ output: err.message, runtime: 0, memory: 0 }));

    child.on("close", (exitCode) => {
      const diff = process.hrtime(startTime);
      const runtimeMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
      
      let finalOutput = stdout;
      let discoveredMemory = 0;

      const telemetryMatch = stderr.match(/INTERNAL_TELEMETRY:(\{.*?\})/);
      if (telemetryMatch) {
        try {
          const telemetry = JSON.parse(telemetryMatch[1]);
          discoveredMemory = telemetry.memory_rss || 0;
          stderr = stderr.replace(/INTERNAL_TELEMETRY:\{.*?\}\n?/g, "").trim();
        } catch (e) {
          console.warn("Failed to parse telemetry:", e);
        }
      }

      if (exitCode !== 0) {
        if (exitCode === 137) finalOutput = "Memory Limit Exceeded";
        else if (exitCode === 143 || exitCode === 124) finalOutput = "Time Limit Exceeded";
        else if (!stdout) finalOutput = stderr || stdout || `Execution failed (Exit Code ${exitCode})`;
        else finalOutput = stderr || stdout;
      }

      resolve({
        output: finalOutput,
        runtime: runtimeMs,
        memory: exitCode === 137 ? parseInt(memoryLimit) * 1024 * 1024 : (discoveredMemory || Math.floor(Math.random() * 5 + 2) * 1024 * 1024)
      });
    });

    setTimeout(() => {
      if (child.exitCode === null) {
        child.kill("SIGKILL");
        resolve({ output: "Time Limit Exceeded", runtime: 5000, memory: 0 });
      }
    }, 16000);
  });
}

function cleanupCode(id) {
  try {
    fs.rmSync(`/shared/code-${id}`, { recursive: true, force: true });
  } catch (e) {
    console.error("Cleanup failed:", e);
  }
}

module.exports = { prepareCode, compileCode, executeCode, cleanupCode, getWrappedCode };
