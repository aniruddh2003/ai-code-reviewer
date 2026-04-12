// const OpenAI = require("openai");

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

async function reviewCode(code) {
  try {
    // const response = await client.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [
    //     {
    //       role: "user",
    //       content: `Review this code. Give bugs and improvements:\n${code}`,
    //     },
    //   ],
    // });

    // return response.choices[0].message.content;
    return "Hello from AI reviewer! This is a placeholder response.";
  } catch (err) {
    return "AI review failed";
  }
}

module.exports = { reviewCode };
