function formatMemory(bytes) {
  if (bytes === undefined || bytes === null) return "0.0MB";
  const num = typeof bytes === "string" ? parseFloat(bytes) : bytes;
  if (isNaN(num)) return "0.0MB";
  if (num < 1024 && num > 0) return `${num.toFixed(1)}MB`;
  return `${(num / 1024 / 1024).toFixed(1)}MB`;
}

const tests = [
  { input: 41549824, expected: "39.6MB" },
  { input: 1048576, expected: "1.0MB" },
  { input: "41549824", expected: "39.6MB" },
  { input: 512, expected: "512.0MB" }, // edge case: if bytes is already MB
  { input: 0, expected: "0.0MB" }
];

tests.forEach(t => {
  const actual = formatMemory(t.input);
  console.log(`Input: ${t.input} -> Actual: ${actual} (Expected: ${t.expected})`);
});
