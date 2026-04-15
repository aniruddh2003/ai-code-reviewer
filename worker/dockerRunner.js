const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function runInDocker(code, language, stdin = "") {
  const id = uuidv4();
  const tempDir = `/shared/code-${id}`;

  fs.mkdirSync(tempDir, { recursive: true });

  const filePath = path.join(
    tempDir,
    language === "node" || language === "javascript"
      ? "script.js"
      : language === "cpp" || language === "c++"
        ? "script.cpp"
        : "script.py",
  );

  fs.writeFileSync(filePath, code);

  let memoryLimit = "100m";
  if (language === "cpp" || language === "c++") {
    memoryLimit = "200m";
  } else if (language === "go") {
    memoryLimit = "256m";
  }

  let dockerArgs = ["run", "--rm", "-i", "-v", "code-exec-share:/shared", `--memory=${memoryLimit}`, "--cpus=0.5"];


  let wrappedCode = code;

  if (language === "python") {
    wrappedCode = `
import sys
import json

${code}

def __parse_arg(val):
    try:
        return json.loads(val)
    except:
        return val

if __name__ == "__main__":
    __lines = [line.strip() for line in sys.stdin.readlines() if line.strip()]
    __args = [__parse_arg(l) for l in __lines]
    __func = globals().get('compute_result') or globals().get('solution') or globals().get('main')
    if __func:
        __res = __func(*__args)
        if __res is not None:
            print(json.dumps(__res) if not isinstance(__res, str) else __res)
    else:
        print("Error: No function found. Please define 'compute_result' or 'solution'.", file=sys.stderr)
        sys.exit(1)
`;
    fs.writeFileSync(filePath, wrappedCode);
    dockerArgs.push("python-runner", "python", `/shared/code-${id}/script.py`);
  } else if (language === "node" || language === "javascript") {
    wrappedCode = `
const fs = require('fs');
${code}

function __parseArg(val) {
    try { return JSON.parse(val); } catch (e) { return val; }
}

try {
    const __lines = fs.readFileSync(0, 'utf8').split('\\n').map(l => l.trim()).filter(Boolean);
    const __args = __lines.map(__parseArg);
    const __func = (typeof computeResult === 'function') ? computeResult : 
                   ((typeof solution === 'function') ? solution : 
                   ((typeof main === 'function') ? main : null));

    if (__func) {
        const __res = __func(...__args);
        if (__res !== undefined) {
            console.log(typeof __res === 'string' ? __res : JSON.stringify(__res));
        }
    } else {
        process.stderr.write("Error: No function found. Please define 'computeResult' or 'solution'.\\n");
        process.exit(1);
    }
} catch (e) {
    process.stderr.write(e.message + "\\n");
    process.exit(1);
}
`;
    fs.writeFileSync(filePath, wrappedCode);
    dockerArgs.push("js-runner", "node", `/shared/code-${id}/script.js`);
  } else if (language === "cpp" || language === "c++") {
    wrappedCode = `
#include <iostream>
#include <vector>
#include <string>
#include <tuple>
#include <type_traits>
#include <nlohmann/json.hpp>

using namespace std;
using json = nlohmann::json;

${code}

// --- Generic Judge Wrapper (C++17) ---
template <typename T, size_t... Is>
auto parse_to_tuple(const vector<json>& args, index_sequence<Is...>) {
    return make_tuple(args[Is].get<decay_t<tuple_element_t<Is, T>>>()...);
}

template <typename F>
void run_judge(F func) {
    vector<json> v_args;
    string line;
    while (getline(cin, line) && !line.empty()) {
        try { v_args.push_back(json::parse(line)); } catch (...) { v_args.push_back(line); }
    }
}

// Support for free functions
template <typename R, typename... Args>
void execute(R (*func)(Args...)) {
    vector<json> v_args;
    string line;
    while (getline(cin, line) && !line.empty()) {
        try { v_args.push_back(json::parse(line)); } catch (...) { v_args.push_back(line); }
    }
    
    if (v_args.size() < sizeof...(Args)) {
        cerr << "Error: Expected " << sizeof...(Args) << " args, got " << v_args.size() << endl;
        exit(1);
    }

    using ArgTuple = tuple<decay_t<Args>...>;
    auto t_args = parse_to_tuple<ArgTuple>(v_args, make_index_sequence<sizeof...(Args)>{});
    
    if constexpr (is_void_v<R>) {
        apply(func, t_args);
    } else {
        auto res = apply(func, t_args);
        cout << json(res).dump() << endl;
    }
}

int main() {
    // We prioritize 'solution' as a free function for simplicity in this prototype
    // This can be expanded to Solution class methods using similar template logic
    execute(solution);
    return 0;
}
`;
    fs.writeFileSync(filePath, wrappedCode);
    dockerArgs.push("cpp-runner", "sh", "-c", `g++ -std=c++17 -o /shared/code-${id}/prog /shared/code-${id}/script.cpp && /shared/code-${id}/prog`);
  } else {
    fs.rmSync(tempDir, { recursive: true, force: true });
    return "Unsupported language";
  }

  return new Promise((resolve) => {
    const child = spawn("docker", dockerArgs, { timeout: 10000 });

    let stdout = "";
    let stderr = "";

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      fs.rmSync(tempDir, { recursive: true, force: true });
      resolve(err.message);
    });

    child.on("close", (code) => {
      fs.rmSync(tempDir, { recursive: true, force: true });
      if (code === 0) {
        resolve(stdout);
      } else {
        resolve(stderr || stdout || `Process exited with code ${code}`);
      }
    });

    // Handle internal timeout fallback (though spawn has timeout option)
    setTimeout(() => {
      if (child.exitCode === null) {
        child.kill();
        resolve("Timeout Execution Error");
      }
    }, 11000);
  });
}

module.exports = { runInDocker };
