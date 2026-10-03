const memos = new WeakMap();
/**
 * Runs `load` once per request and key; later calls in the same request get
 * the same promise (including its failure). The guard, the current-server
 * lookup, and the handler share one database read this way.
 */
export function requestMemo(request, key, load) {
    let memo = memos.get(request);
    if (memo === undefined) {
        memo = new Map();
        memos.set(request, memo);
    }
    const existing = memo.get(key);
    if (existing !== undefined)
        return existing;
    const promise = load();
    memo.set(key, promise);
    return promise;
}
/** Replaces a memoized value after this request changed it (for example a fresh membership check). */
export function setRequestMemo(request, key, value) {
    let memo = memos.get(request);
    if (memo === undefined) {
        memo = new Map();
        memos.set(request, memo);
    }
    memo.set(key, Promise.resolve(value));
}
//# sourceMappingURL=RequestMemo.js.map