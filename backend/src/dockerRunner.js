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

  fs.mkdirSync(tempDir, { recursive: true });

  const filePath = path.join(
    tempDir,
    language === "node" || language === "javascript"
      ? "script.js"
      : language === "cpp" || language === "c++"
        ? "script.cpp"
        : "script.py",
  );

  let memoryLimit = "100m";
  if (language === "cpp" || language === "c++") {
    memoryLimit = "200m";
  } else if (language === "go") {
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
    dockerArgs.push("cpp-runner", "sh", "-c", `g++ -std=c++17 -o /shared/code-${id}/prog /shared/code-${id}/script.cpp && /shared/code-${id}/prog`);
  } else {
    fs.rmSync(tempDir, { recursive: true, force: true });
    return "Unsupported language";
  }

  return new Promise((resolve) => {
    const child = spawn("docker", dockerArgs, { timeout: 10000 });

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
      resolve(err.message);
    });

    child.on("close", (code) => {
      fs.rmSync(tempDir, { recursive: true, force: true });
      if (code === 0) {
        resolve(stdout);
      } else {
        resolve(stderr || stdout || `Process exited with code ${code}`);
      }
    });

    // Handle internal timeout fallback (though spawn has timeout option)
    setTimeout(() => {
      if (child.exitCode === null) {
        child.kill();
        resolve("Timeout Execution Error");
      }
    }, 11000);
  });
}

module.exports = { runInDocker, getWrappedCode };
