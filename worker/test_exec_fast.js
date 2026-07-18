const { prepareCode, compileCode, executeCode, cleanupCode } = require("./dockerRunner");

async function run() {
  const code = `
vector<int> solution(vector<int>& nums, int target) {
    return {-1, -1};
}
`;
  console.log("Preparing...");
  const execId = prepareCode(code, "cpp");

  console.log("Compiling...");
  const t1 = Date.now();
  const compileRes = await compileCode(execId, "cpp");
  console.log("Compiled in", Date.now() - t1, "ms. Success:", compileRes.success);

  console.log("Executing test case 1...");
  const t2 = Date.now();
  const res1 = await executeCode(execId, "cpp", "[2,7,11,15]\n9\n");
  console.log("Executed 1 in", Date.now() - t2, "ms. Output:", res1.output.trim());

  console.log("Executing test case 2...");
  const t3 = Date.now();
  const res2 = await executeCode(execId, "cpp", "[3,2,4]\n6\n");
  console.log("Executed 2 in", Date.now() - t3, "ms. Output:", res2.output.trim());

  cleanupCode(execId);
  console.log("Done.");
}

run();
