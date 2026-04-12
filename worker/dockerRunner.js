const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { v4: uuidv4 } = require("uuid");

async function runInDocker(code, language) {
  const id = uuidv4();
  const tempDir = `/tmp/code-${id}`;

  fs.mkdirSync(tempDir);

  const filePath = path.join(tempDir, "script.py");
  fs.writeFileSync(filePath, code);

  return new Promise((resolve) => {
    exec(
      `docker run --rm \
      -v ${tempDir}:/app \
      --memory=100m \
      --cpus="0.5" \
      python-runner`,
      { timeout: 5000 },
      (err, stdout, stderr) => {
        fs.rmSync(tempDir, { recursive: true, force: true });

        if (err) return resolve(stderr || err.message);

        resolve(stdout);
      },
    );
  });
}

module.exports = { runInDocker };
