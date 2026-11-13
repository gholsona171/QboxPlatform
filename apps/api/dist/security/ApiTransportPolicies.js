/** Explicit no-op implementation used while rate limiting is disabled. */
export const noOpRateLimitEvaluator = Object.freeze({
    evaluate: async () => ({ allowed: true }),
});
//# sourceMappingURL=ApiTransportPolicies.js.map