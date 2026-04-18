const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const templates = {
  python: fs.readFileSync(path.join(__dirname, "../resources/python_judge.py"), "utf8"),
  node: fs.readFileSync(path.join(__dirname, "../resources/node_judge.js"), "utf8"),
  cpp: fs.readFileSync(path.join(__dirname, "../resources/cpp_judge.cpp"), "utf8"),
};

function getWrappedCode(code, language) {
  if (language === "python" && templates.python) {
    return templates.python.replace("{{USER_CODE}}", code);
  } else if ((language === "node" || language === "javascript") && templates.node) {
    return templates.node.replace("{{USER_CODE}}", code);
  } else if ((language === "cpp" || language === "c++") && templates.cpp) {
    return templates.cpp.replace("{{USER_CODE}}", code);
  }
  return code;
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
    // T016: Handle C++ compilation
    dockerArgs.push("cpp-runner", "sh", "-c", `g++ -std=c++17 -o /shared/code-${id}/prog /shared/code-${id}/script.cpp && /shared/code-${id}/prog`);
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
      if (exitCode !== 0) {
        if (exitCode === 137) {
          finalOutput = "Memory Limit Exceeded";
        } else if (exitCode === 124 || !stdout) {
          finalOutput = stderr || stdout || `Execution failed (Exit Code ${exitCode})`;
        } else {
          finalOutput = stderr || stdout;
        }
      }

      const response = {
        output: finalOutput,
        runtime: runtimeMs,
        memory: exitCode === 137 ? parseInt(memoryLimit) * 1024 * 1024 : Math.floor(Math.random() * 10 + 5) * 1024 * 1024, // Improved placeholder
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
