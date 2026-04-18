const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
const serviceAccount = require("../service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const problems = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays",
    order: 1,
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]"
      }
    ],
    starterCode: {
      javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction solution(nums, target) {\n    \n}",
      python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
    },
    testCases: [
      { input: "[2,7,11,15]\n9", output: "[0,1]" },
      { input: "[3,2,4]\n6", output: "[1,2]" },
      { input: "[3,3]\n6", output: "[0,1]" },
      { input: "[1,5,10,20]\n30", output: "[2,3]" }
    ]
  },
  {
    id: "reverse-int",
    title: "Reverse Integer",
    difficulty: "Medium",
    category: "Math",
    order: 2,
    description: "Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing `x` causes the value to go outside the signed 32-bit integer range `[-2^31, 2^31 - 1]`, then return `0`.\n\n**Assume the environment does not allow you to store 64-bit integers (signed or unsigned).**",
    examples: [
      {
        input: "x = 123",
        output: "321"
      },
      {
        input: "x = -123",
        output: "-321"
      },
      {
        input: "x = 120",
        output: "21"
      }
    ],
    starterCode: {
      javascript: "/**\n * @param {number} x\n * @return {number}\n */\nfunction solution(x) {\n    \n}",
      python: "class Solution:\n    def reverse(self, x: int) -> int:\n        ",
      cpp: "class Solution {\npublic:\n    int reverse(int x) {\n        \n    }\n};"
    },
    testCases: [
      { input: "123", output: "321" },
      { input: "-123", output: "-321" },
      { input: "120", output: "21" },
      { input: "1534236469", output: "0" },
      { input: "-2147483648", output: "0" }
    ]
  }
];

async function seed() {
  console.log("🚀 Starting seeding process...");

  for (const problem of problems) {
    const { id, testCases, ...problemData } = problem;
    const problemRef = db.collection("problems").doc(id);
    
    console.log(`📦 Seeding problem: ${id}`);
    await problemRef.set(problemData, { merge: true });

    // Seed test cases subcollection
    const tcCollection = problemRef.collection("testCases");
    
    // Cleanup old test cases (optional, but good for clean seed)
    const existingTC = await tcCollection.get();
    for (const doc of existingTC.docs) {
      await doc.ref.delete();
    }

    for (let i = 0; i < testCases.length; i++) {
        await tcCollection.doc(`tc-${i+1}`).set(testCases[i]);
    }
    console.log(`✅ [${id}] Seeded with ${testCases.length} test cases.`);
  }

  console.log("🏁 Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
