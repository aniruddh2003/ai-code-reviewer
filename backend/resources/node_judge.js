const fs = require('fs');
{{USER_CODE}}

function __parseArg(val) {
    try { return JSON.parse(val); } catch (e) { return val; }
}

try {
    const __lines = fs.readFileSync(0, 'utf8').split('\n').map(l => l.trim()).filter(Boolean);
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
        process.stderr.write("Error: No function found. Please define 'computeResult' or 'solution'.\n");
        process.exit(1);
    }
} catch (e) {
    process.stderr.write(e.message + "\n");
    process.exit(1);
}
