async function runMultilingualVerification() {
  const languages = [
    {
      name: "Python",
      payload: {
        language: "python",
        code: "def compute_result(n, arr):\n    return sum(arr) - n",
        testCases: [
          { name: "leetcode style python", input: "14\n[1, 2, 3, 4, 5, 6, 7]", expected: "14\n" }
        ]
      }
    },
    {
      name: "Node.js",
      payload: {
        language: "node",
        code: "function computeResult(n, arr) {\n    return arr.reduce((sum, num) => sum + num, 0) - n;\n}",
        testCases: [{ name: "leetcode style node", input: "14\n[1, 2, 3, 4, 5, 6, 7]", expected: "14\n" }]
      }
    },
    {
      name: "C++ (Simple)",
      payload: {
        language: "cpp",
        code: "int solution(int n, vector<int> arr) {\n  int sum = 0;\n  for (int x : arr) sum += x;\n  return sum - n;\n}",
        testCases: [{ name: "simple cpp", input: "14\n[1, 2, 3, 4, 5, 6, 7]", expected: "14\n" }]
      }
    },
    {
      name: "C++ (Complex)",
      payload: {
        language: "cpp",
        code: "string solution(int number,vector<vector<int>> matrix) {\n  int diagSum = 0;\n  for(int i=0; i<matrix.size(); ++i) diagSum += matrix[i][i];\n  return \"Substracted Diagonal Sum: \" + to_string(number - diagSum);\n}",
        testCases: [{ name: "2D vector cpp", input: "50\n[[10, 20], [30, 40]]", expected: "\"Substracted Diagonal Sum: 0\"\n" }]
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const lang of languages) {
    console.log(`\n🚀 Testing ${lang.name}...`);
    try {
      const res = await fetch("http://localhost:3000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lang.payload)
      });
      const data = await res.json();
      console.log(`✅ Submission accepted, jobId: ${data.jobId}`);

      let status = "queued";
      let attempts = 0;
      while (status !== "completed" && attempts < 20) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(`http://localhost:3000/status/${data.jobId}`);
        const statusData = await statusRes.json();
        status = statusData.status;
        if (status === "completed") {
          const pass = statusData.result.allPassed;
          console.log(`📊 ${lang.name} Result:`, pass ? "✅ PASS" : "❌ FAIL");
          if (!pass) {
            console.log("Details:", JSON.stringify(statusData.result.testResults, null, 2));
            failed++;
          } else {
            passed++;
          }
          break;
        }
        if (status === "failed") {
          console.log(`❌ ${lang.name} job FAILED`);
          failed++;
          break;
        }
        attempts++;
      }
      if (attempts >= 20) {
        console.log(`⏰ ${lang.name} timed out waiting for result`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ ${lang.name} Error:`, err.message);
      failed++;
    }
  }

  console.log(`\n${"=".repeat(40)}`);
  console.log(`📋 Summary: ${passed} passed, ${failed} failed out of ${languages.length}`);
  console.log(`${"=".repeat(40)}`);
}

runMultilingualVerification();
