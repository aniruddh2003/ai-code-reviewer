const { spawn } = require("child_process");

const startTime = Date.now();
const child = spawn("docker", [
  "run", "--rm", "cpp-runner",
  "sh", "-c", "echo 'int main(){return 0;}' > /tmp/prog.cpp && g++ -std=c++17 -o /tmp/prog /tmp/prog.cpp"
]);

child.on("close", (code) => {
  console.log("Exit code:", code);
  console.log("Time taken:", Date.now() - startTime, "ms");
});
