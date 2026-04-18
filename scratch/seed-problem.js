const admin = require("firebase-admin");
const path = require("path");

// Load local service account if exists, else expect environment
const serviceAccountPath = path.join(__dirname, "../service-account.json");
let config = {};

try {
  const serviceAccount = require(serviceAccountPath);
  config = {
    credential: admin.credential.cert(serviceAccount)
  };
} catch (e) {
  console.log("No service-account.json found, using default credentials...");
  config = {
    credential: admin.credential.applicationDefault()
  };
}

if (!admin.apps.length) {
  admin.initializeApp(config);
}

const db = admin.firestore();

async function seedTwoSum() {
  const problemId = "two-sum";
  const problemRef = db.collection("problems").doc(problemId);

  const problemData = {
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    examples: [
      {
        input: "[2,7,11,15]\n9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "[3,2,4]\n6",
        output: "[1,2]"
      }
    ],
    starterCode: {
      javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
      python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  console.log(`🌱 Seeding problem: ${problemId}...`);
  await problemRef.set(problemData, { merge: true });

  // Add hidden test cases
  const testCases = [
    { input: "[3,3]\n6", output: "[0,1]" },
    { input: "[1,2,3,4,5]\n9", output: "[3,4]" },
    { input: "[10,20,30,40]\n70", output: "[2,3]" }
  ];

  const tcCollection = problemRef.collection("testCases");
  console.log(`🧪 Adding ${testCases.length} hidden test cases...`);

  for (let i = 0; i < testCases.length; i++) {
    await tcCollection.doc(`tc-${i}`).set(testCases[i]);
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seedTwoSum().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
