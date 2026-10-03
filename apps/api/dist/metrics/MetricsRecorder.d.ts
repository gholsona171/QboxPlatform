/** Completed HTTP request measurement prepared for future instrumentation. */
export interface ApiRequestMeasurement {
    readonly method: string;
    readonly route: string;
    readonly statusCode: number;
    readonly durationMs: number;
    readonly requestBytes?: number;
    readonly responseBytes?: number;
}
/** Safe transport-security event prepared for future metrics backends. */
export interface ApiTransportEvent {
    readonly code: string;
    readonly route: string;
    readonly statusCode: number;
}
/** Transport metrics boundary; implementations must not retain sensitive data. */
export interface MetricsRecorder {
    recordRequest(measurement: ApiRequestMeasurement): void;
    recordTransportEvent(event: ApiTransportEvent): void;
}
/** Default no-op recorder used until a metrics backend is approved. */
export declare const noOpMetricsRecorder: MetricsRecorder;
//# sourceMappingURL=MetricsRecorder.d.ts.map