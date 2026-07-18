const { runInDocker } = require("../worker/dockerRunner");

async function test() {
  console.log("--- Test 1: Valid C++ ---");
  const validCode = `
#include <iostream>
void solution(int x) { std::cout << x * 2 << std::endl; }
`;
  const res1 = await runInDocker(validCode, "cpp", "5");
  console.log("Result 1:", res1);

  console.log("\n--- Test 2: Invalid C++ ---");
  const invalidCode = `
#include <iostream>
void solution(int x) { std::cout << x * 2 << std::endl // Missing semicolon
`;
  const res2 = await runInDocker(invalidCode, "cpp", "5");
  console.log("Result 2:", res2);
}

test().catch(console.error);
