/** Default no-op recorder used until a metrics backend is approved. */
export const noOpMetricsRecorder = Object.freeze({
    recordRequest: () => undefined,
    recordTransportEvent: () => undefined,
});
//# sourceMappingURL=MetricsRecorder.js.map