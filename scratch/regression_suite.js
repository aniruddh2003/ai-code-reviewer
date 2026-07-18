const { runInDocker } = require("../worker/dockerRunner");

const CASES = [
  {
    lang: "node",
    code: "function solution(n) { return n * n; }",
    input: "5",
    expected: "25",
    name: "JS Square"
  },
  {
    lang: "python",
    code: "def solution(n): return n * n",
    input: "5",
    expected: "25",
    name: "Python Square"
  },
  {
    lang: "cpp",
    code: "#include <iostream>\\nvoid solution(int n) { std::cout << n * n << std::endl; }",
    input: "5",
    expected: "25",
    name: "C++ Square"
  },
  {
    lang: "cpp",
    code: "#include <iostream>\\nvoid solution(int n) { std::cout << n * n << std::endl // Missing semicolon",
    input: "5",
    type: "COMPILATION_ERROR",
    name: "C++ Broken"
  },
  {
    lang: "cpp",
    code: "#include <iostream>\\nvoid solution(int n) { while(true); }",
    input: "5",
    type: "TLE",
    name: "C++ TLE"
  }
];

async function runRegression() {
  console.log("🚀 Starting Judge Pipeline Regression Suite...");
  
  for (const c of CASES) {
    process.stdout.write(`Testing ${c.name}... `);
    try {
      const res = await runInDocker(c.code.replace(/\\n/g, "\n"), c.lang, c.input);
      
      if (c.type === "COMPILATION_ERROR") {
        if (res.isCompilationError) console.log("✅ Correctly detected Compilation Error");
        else console.log("❌ Failed to detect Compilation Error", res);
      } else if (c.type === "TLE") {
        if (res.output === "Time Limit Exceeded") console.log("✅ Correctly detected TLE");
        else console.log("❌ Failed to detect TLE", res);
      } else {
        const actual = res.output.trim();
        if (actual === c.expected) {
          console.log(`✅ PASS (Runtime: ${res.runtime}ms, Memory: ${(res.memory/1024/1024).toFixed(2)}MB)`);
        } else {
          console.log(`❌ FAIL (Expected ${c.expected}, got ${actual})`);
        }
      }
    } catch (e) {
      console.log("💥 CRASHED:", e.message);
    }
  }
}

runRegression().catch(console.error);
