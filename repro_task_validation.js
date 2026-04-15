

async function runRepro() {
  console.log("🚀 Testing Automated Test Case Validation Submission...");
  
  const payload = {
    language: "python",
    code: "import sys\nfor line in sys.stdin:\n    print(int(line) * 2)",
    testCases: [
      { name: "double 5", input: "5", "expected": "10\n" },
      { name: "double 10", input: "10", "expected": "20\n" }
    ]
  };

  try {
    const res = await fetch("http://localhost:3000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("✅ Submission accepted, jobId:", data.jobId);
    
    let status = "queued";
    let attempts = 0;
    while (status !== "completed" && attempts < 20) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await fetch(`http://localhost:3000/status/${data.jobId}`);
      const statusData = await statusRes.json();
      status = statusData.status;
      console.log(`⏳ Job status: ${status}`);
      if (status === "completed") {
        console.log("📊 Results:", JSON.stringify(statusData.result, null, 2));
        if (statusData.result.testResults) {
          console.log("🎉 SUCCESS: testResults found!");
          process.exit(0);
        } else {
          console.error("❌ FAILURE: testResults MISSING in output.");
          process.exit(1);
        }
      }
      attempts++;
    }
    console.error("❌ TIMEOUT: Job did not complete in time.");
    process.exit(1);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

runRepro();
