const { runInDocker } = require("./worker/dockerRunner");

async function testStdinSupport() {
  console.log("🛠️ Testing Docker Stdin Support...");
  
  // A simple python script that reads from stdin
  const code = "import sys\nprint(f'READ: {sys.stdin.read().strip()}')";
  const language = "python";
  const stdin = "Antigravity Power";

  try {
    // Current runInDocker doesn't accept a 3rd parameter, but we'll try it
    const output = await runInDocker(code, language, stdin);
    console.log("📤 Output:", output);
    
    if (output.includes("READ: Antigravity Power")) {
      console.log("🎉 SUCCESS: Stdin is working!");
      process.exit(0);
    } else {
      console.log("❌ FAILURE: Stdin prefix missing from output.");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

testStdinSupport();
