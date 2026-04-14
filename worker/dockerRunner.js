const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function runInDocker(code, language) {
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
  fs.writeFileSync(filePath, code);

  let dockerCmd = "";
  if (language === "python") {
    dockerCmd = `docker run --rm -v ${tempDir}:/app --memory=100m --cpus="0.5" python-runner python /app/script.py`;
  } else if (language === "node" || language === "javascript") {
    dockerCmd = `docker run --rm -v ${tempDir}:/app --memory=100m --cpus="0.5" js-runner node /app/script.js`;
  } else if (language === "go") {
    dockerCmd = `docker run --rm -v ${tempDir}:/app -w /app --memory=200m --cpus="0.5" golang:1.20-alpine go run script.go`;
  } else {
    fs.rmSync(tempDir, { recursive: true, force: true });
    return "Unsupported language";
  }

  return new Promise((resolve) => {
    exec(dockerCmd, { timeout: 10000 }, (err, stdout, stderr) => {
      fs.rmSync(tempDir, { recursive: true, force: true });

      // Edge case: Timeouts
      if (err && err.killed) {
        return resolve("Timeout Execution Error");
      }

      if (err) {
        return resolve(stderr || err.message);
      }

      resolve(stdout);
    });
  });
}

module.exports = { runInDocker };
