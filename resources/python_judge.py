import sys
import json

{{USER_CODE}}

def __parse_arg(val):
    try:
        return json.loads(val)
    except:
        return val

if __name__ == "__main__":
    __lines = [line.strip() for line in sys.stdin.readlines() if line.strip()]
    __args = [__parse_arg(l) for l in __lines]
    __solution_class = globals().get('Solution')
    __func = globals().get('compute_result') or globals().get('solution') or globals().get('main')
    
    if not __func and __solution_class:
        __inst = __solution_class()
        # Look for the first method that isn't special/private
        __methods = [getattr(__inst, m) for m in dir(__inst) if not m.startswith('_')]
        if __methods:
            __func = __methods[0]

    if __func:
        __res = __func(*__args)
        if __res is not None:
            print(json.dumps(__res) if not isinstance(__res, str) else __res)
    else:
        print("Error: No entry point found. Please define 'Solution' class or 'solution' function.", file=sys.stderr)
        sys.exit(1)
