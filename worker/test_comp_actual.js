const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const template = fs.readFileSync(path.join(__dirname, "../resources/cpp_judge.cpp"), "utf8");
const code = template.replace("{{USER_CODE}}", "int solution() { return 0; }");
fs.writeFileSync("/shared/test_cpp.cpp", code);

const startTime = Date.now();
const child = spawn("docker", [
  "run", "--rm", "-v", "code-exec-share:/shared", "cpp-runner",
  "sh", "-c", "g++ -std=c++17 -o /tmp/prog /shared/test_cpp.cpp"
]);

child.on("close", (code) => {
  console.log("Exit code:", code);
  console.log("Time taken:", Date.now() - startTime, "ms");
});
