async function runMultilingualVerification() {
  const languages = [
    {
      name: "Python",
      payload: {
        language: "python",
        code: "import sys\nfor line in sys.stdin:\n    print(int(line.strip()) * 2)",
        testCases: [
          { name: "double 5", input: "5", expected: "10\n" },
          { name: "double 10", input: "10", expected: "20\n" }
        ]
      }
    },
    {
      name: "Node.js",
      payload: {
        language: "node",
        code: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(parseInt(input) * 3);",
        testCases: [{ name: "triple 5", input: "5", expected: "15\n" }]
      }
    },
    {
      name: "Go",
      payload: {
        language: "go",
        code: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"Hello, World!\")\n}",
        testCases: [{ name: "hello", input: "", expected: "Hello, World!\n" }]
      }
    },
    {
      name: "C++",
      payload: {
        language: "cpp",
        code: "#include <iostream>\nusing namespace std;\nint main() {\n  int n;\n  if (cin >> n) {\n    cout << n * 5 << endl;\n  }\n  return 0;\n}",
        testCases: [{ name: "quintuple 5", input: "5", expected: "25\n" }]
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
