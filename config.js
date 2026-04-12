require("dotenv").config();

const requiredEnvVars = ["OPENAI_API_KEY"];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`  - ${key}`));
    process.exit(1);
  }

  console.log("✅ Environment validation passed");
}

module.exports = { validateEnv };
