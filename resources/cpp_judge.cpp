#include <iostream>
#include <vector>
#include <string>
#include <tuple>
#include <type_traits>
#include <utility>
#include <map>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <cmath>
#include <queue>
#include <stack>
#include <nlohmann/json.hpp>

using namespace std;
using json = nlohmann::json;

{{USER_CODE}}

// --- Generic Judge Wrapper (C++17) ---
template <typename T, size_t... Is>
auto parse_to_tuple(const vector<json>& args, index_sequence<Is...>) {
    return make_tuple(args[Is].get<decay_t<tuple_element_t<Is, T>>>()...);
}

// Support for free functions
template <typename R, typename... Args>
void execute(R (*func)(Args...)) {
    vector<json> v_args;
    string line;
    // Read all input lines until EOF or empty line
    while (getline(cin, line)) {
        if (line.empty()) continue;
        try { 
            v_args.push_back(json::parse(line)); 
        } catch (...) { 
            // Fallback for raw strings if they aren't JSON-formatted
            v_args.push_back(line); 
        }
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
    execute(solution);
    return 0;
}
