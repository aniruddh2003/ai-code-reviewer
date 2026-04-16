const { getWrappedCode } = require("./dockerRunner");

describe("dockerRunner.getWrappedCode", () => {
    test("should correctly wrap Python code with the Hidden Judge", () => {
        const code = "def solution(a, b): return a + b";
        const wrapped = getWrappedCode(code, "python");
        
        expect(wrapped).toContain("import sys");
        expect(wrapped).toContain("import json");
        expect(wrapped).toContain(code);
        expect(wrapped).toContain("globals().get('compute_result') or globals().get('solution')");
    });

    test("should correctly wrap Node.js code with the Hidden Judge", () => {
        const code = "function solution(a, b) { return a + b; }";
        const wrapped = getWrappedCode(code, "node");
        
        expect(wrapped).toContain("const fs = require('fs')");
        expect(wrapped).toContain(code);
        expect(wrapped).toContain("typeof computeResult === 'function'");
        expect(wrapped).toContain("typeof solution === 'function'");
    });

    test("should correctly wrap C++ code with the Hidden Judge", () => {
        const code = "int solution(int a, int b) { return a + b; }";
        const wrapped = getWrappedCode(code, "cpp");
        
        expect(wrapped).toContain("#include <nlohmann/json.hpp>");
        expect(wrapped).toContain(code);
        expect(wrapped).toContain("execute(solution)");
    });

    test("should return original code for unsupported languages", () => {
        const code = "print('hello')";
        const wrapped = getWrappedCode(code, "ruby");
        expect(wrapped).toBe(code);
    });
});
