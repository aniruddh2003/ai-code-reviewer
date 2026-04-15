const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function runInDocker(code, language, stdin = "") {
  fs.appendFileSync("/tmp/debug.log", `--- START runInDocker (${language}) ---\n`);
  const id = uuidv4();
  const tempDir = `/tmp/code-${id}`;

  fs.mkdirSync(tempDir, { recursive: true });

  const filePath = path.join(
    tempDir,
    language === "node" || language === "javascript"
      ? "script.js"
      : language === "go"
        ? "script.go"
        : "script.py",
  );
  
  console.log(`📝 Writing code to ${filePath}...`);
  fs.writeFileSync(filePath, code);
  console.log(`📂 Directory contents:`, fs.readdirSync(tempDir));

  let dockerArgs = ["run", "--rm", "-i", "-v", `${tempDir}:/app`, "--memory=100m", "--cpus=0.5"];
  
  if (language === "python") {
    dockerArgs.push("python-runner", "python", "/app/script.py");
  } else if (language === "node" || language === "javascript") {
    dockerArgs.push("js-runner", "node", "/app/script.js");
  } else if (language === "go") {
    dockerArgs.push("-w", "/app", "golang:1.20-alpine", "go", "run", "script.go");
  } else {
    // fs.rmSync(tempDir, { recursive: true, force: true }); // Debug: Keep it
    return "Unsupported language";
  }

  return new Promise((resolve) => {
    console.log(`🚀 Spawning docker with args:`, dockerArgs);
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
        resolve(stderr || `Process exited with code ${code}`);
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

module.exports = { runInDocker };
