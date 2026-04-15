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
    __func = globals().get('compute_result') or globals().get('solution') or globals().get('main')
    if __func:
        __res = __func(*__args)
        if __res is not None:
            print(json.dumps(__res) if not isinstance(__res, str) else __res)
    else:
        print("Error: No function found. Please define 'compute_result' or 'solution'.", file=sys.stderr)
        sys.exit(1)
