async function runMultilingualVerification() {
  const languages = [
    {
      name: "Python",
      payload: {
        language: "python",
        code: "def solution(n, arr):\n    return sum(arr) - n",
        testCases: [
          { name: "leetcode style python", input: "14\n[1, 2, 3, 4, 5, 6, 7]", expected: "14\n" }
        ]
      }
    },
    {
      name: "Python (3D Vector)",
      payload: {
        language: "python",
        code: "def solution(cube):\n    return sum(sum(sum(row) for row in plane) for plane in cube)",
        testCases: [{ name: "3d vector sum", input: "[[[1,1],[1,1]],[[1,1],[1,1]]]", expected: "8" }]
      }
    },
    {
      name: "Python (3D String)",
      payload: {
        language: "python",
        code: "def solution(cube):\n    return sum(sum(sum(len(s) for s in row) for row in plane) for plane in cube)",
        testCases: [{ name: "3d string count", input: '[[["a","b"],["c","d"]],[["e","f"],["g","h"]]]', expected: "8" }]
      }
    },
    {
      name: "Python (Dijkstra)",
      payload: {
        language: "python",
        code: "import heapq\ndef solution(start, n, adj):\n    dist = [float('inf')] * n\n    dist[start] = 0\n    pq = [(0, start)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, w in adj[u]:\n            if dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n                heapq.heappush(pq, (dist[v], v))\n    return dist",
        testCases: [{ 
          name: "python dijkstra", 
          input: "0\n5\n[[[1,4],[2,2]],[[2,3],[3,2],[4,3]],[[1,1],[3,4]],[[4,1]],[]]", 
          expected: "[0, 3, 2, 5, 6]" 
        }]
      }
    },
    {
      name: "Node.js",
      payload: {
        language: "node",
        code: "function solution(n, arr) {\n    return arr.reduce((sum, num) => sum + num, 0) - n;\n}",
        testCases: [{ name: "leetcode style node", input: "14\n[1, 2, 3, 4, 5, 6, 7]", expected: "14\n" }]
      }
    },
    {
      name: "Node.js (3D Vector)",
      payload: {
        language: "node",
        code: "function solution(cube) {\n    return cube.flat(2).reduce((a, b) => a + b, 0);\n}",
        testCases: [{ name: "3d vector sum", input: "[[[1,1],[1,1]],[[1,1],[1,1]]]", expected: "8" }]
      }
    },
    {
      name: "Node.js (3D String)",
      payload: {
        language: "node",
        code: "function solution(cube) {\n    return cube.flat(2).reduce((a, b) => a + b.length, 0);\n}",
        testCases: [{ name: "3d string count", input: '[[["a","b"],["c","d"]],[["e","f"],["g","h"]]]', expected: "8" }]
      }
    },
    {
      name: "Node.js (Dijkstra)",
      payload: {
        language: "node",
        code: "function solution(start, n, adj) {\n    const dist = Array(n).fill(Infinity);\n    dist[start] = 0;\n    const visited = Array(n).fill(false);\n    for (let i = 0; i < n; i++) {\n        let u = -1;\n        for (let v = 0; v < n; v++) {\n            if (!visited[v] && (u === -1 || dist[v] < dist[u])) u = v;\n        }\n        if (u === -1 || dist[u] === Infinity) break;\n        visited[u] = true;\n        for (const [v, w] of adj[u]) {\n            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n        }\n    }\n    return dist.map(d => d === Infinity ? null : d);\n}",
        testCases: [{ 
          name: "node dijkstra", 
          input: "0\n5\n[[[1,4],[2,2]],[[2,3],[3,2],[4,3]],[[1,1],[3,4]],[[4,1]],[]]", 
          expected: "[0,3,2,5,6]" 
        }]
      }
    },
    {
      name: "C++ (Simple)",
      payload: {
        language: "cpp",
        code: "int solution(int n, vector<int> arr) {\n  int sum = 0;\n  for (int x : arr) sum += x;\n  return sum - n;\n}",
        testCases: [{ name: "simple cpp", input: "14\n[1, 2, 3, 4, 5, 6, 7]", expected: "14\n" }]
      }
    },
    {
      name: "C++ (Complex)",
      payload: {
        language: "cpp",
        code: "string solution(int number,vector<vector<int>> matrix) {\n  int diagSum = 0;\n  for(int i=0; i<matrix.size(); ++i) diagSum += matrix[i][i];\n  return \"Substracted Diagonal Sum: \" + to_string(number - diagSum);\n}",
        testCases: [{ name: "2D vector cpp", input: "50\n[[10, 20], [30, 40]]", expected: "\"Substracted Diagonal Sum: 0\"\n" }]
      }
    },
    {
      name: "C++ (3D Vector)",
      payload: {
        language: "cpp",
        code: "#include <vector>\nusing namespace std;\nint solution(vector<vector<vector<int>>> cube) {\n    int sum = 0;\n    for(auto& plane : cube) for(auto& row : plane) for(int x : row) sum += x;\n    return sum;\n}",
        testCases: [{ name: "3d vector sum", input: "[[[1,1],[1,1]],[[1,1],[1,1]]]", expected: "8" }]
      }
    },
    {
      name: "C++ (3D String)",
      payload: {
        language: "cpp",
        code: "#include <vector>\n#include <string>\nusing namespace std;\nint solution(vector<vector<vector<string>>> cube) {\n    int count = 0;\n    for(auto& plane : cube) for(auto& row : plane) for(auto& s : row) count += s.length();\n    return count;\n}",
        testCases: [{ name: "3d string count", input: "[[[\"a\",\"b\"],[\"c\",\"d\"]],[[\"e\",\"f\"],[\"g\",\"h\"]]]", expected: "8" }]
      }
    },
    {
      name: "C++ (Dijkstra)",
      payload: {
        language: "cpp",
        code: `#include <vector>\n#include <queue>\n#include <tuple>\nusing namespace std;\nvector<int> solution(int start, int n, vector<vector<vector<int>>> adj) {\n    vector<int> dist(n, 2147483647);\n    dist[start] = 0;\n    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;\n    pq.push({0, start});\n    while(!pq.empty()){\n        auto [d, u] = pq.top(); pq.pop();\n        if(d > dist[u]) continue;\n        for(auto& edge : adj[u]){\n            int v = edge[0], w = edge[1];\n            if(dist[u] + w < dist[v]){\n                dist[v] = dist[u] + w;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    return dist;\n}`,
        testCases: [{ 
          name: "dijkstra simple", 
          input: "0\n5\n[[[1,4],[2,2]],[[2,3],[3,2],[4,3]],[[1,1],[3,4]],[[4,1]],[]]", 
          expected: "[0,3,2,5,6]" 
        }]
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
