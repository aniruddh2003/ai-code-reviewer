function transformInput(input) {
  if (!input || typeof input !== "string") return input;
  if (input.includes("\n")) return input;
  if (input.includes("=")) {
    try {
      const parts = input.split(/,(?![^\[]*\])/);
      const values = parts.map(p => {
        const eqIdx = p.indexOf("=");
        return eqIdx !== -1 ? p.substring(eqIdx + 1).trim() : p.trim();
      });
      return values.join("\n");
    } catch (e) {
      return input;
    }
  }
  return input;
}

const inputs = [
  "nums = [2,7,11,15], target = 9",
  "l1 = [2,4,3], l2 = [5,6,4]",
  "s = \"abcabcbb\"",
  "n = 5"
];

inputs.forEach(i => {
  console.log(`IN:  ${i}`);
  console.log(`OUT:\n${transformInput(i)}`);
  console.log("---");
});
