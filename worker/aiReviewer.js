// const OpenAI = require("openai");

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

async function reviewCode(code, executionResult = null) {
  try {
    let prompt = `Review this code for bugs and improvements. Provide concise, actionable feedback.`;

    if (executionResult && executionResult.testResults) {
      if (!executionResult.allPassed) {
        // Diagnosis Mode
        const failures = executionResult.testResults.filter(r => r.status === "FAIL");
        prompt = `The following test cases FAILED. Analyze the code logic and identify the underlying flaw or missing edge case:\n\n`;
        failures.forEach(f => {
          prompt += `- Test: ${f.name}\n  Expected: ${f.expected}\n  Actual: ${f.actual}\n`;
        });
        prompt += `\nCode:\n${code}`;
      } else {
        // Optimization Mode
        prompt = `All test cases PASSED. Provide an asymptotic time complexity analysis (Big-O) and suggest potential algorithmic optimizations for performance:\n\nCode:\n${code}`;
      }
    } else {
      // Legacy or No-Tests Mode
      prompt = `Review this code. Give bugs and improvements:\n${code}`;
    }

    // const response = await client.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [{ role: "user", content: prompt }],
    // });
    // return response.choices[0].message.content;

    // For now, logging the prompt to verify logic since we are using a placeholder
    console.log("🤖 AI Prompt Generated:\n", prompt);
    return `AI Review [PASS=${executionResult?.allPassed}]: Mock Feedback based on results.`;
  } catch (err) {
    return "AI review failed";
  }
}

module.exports = { reviewCode };
