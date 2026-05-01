const { runInDocker } = require("./dockerRunner");

async function test() {
  const code = `
vector<int> solution(vector<int>& nums, int target) {
    return {-1, -1};
}
`;
  console.log("Starting C++ test...");
  const start = Date.now();
  const res = await runInDocker(code, "cpp", "[2,7,11,15]\n9\n");
  console.log("Result:", res);
  console.log("Time taken:", Date.now() - start, "ms");
}

test();
