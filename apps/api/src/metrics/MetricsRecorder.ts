/** Completed HTTP request measurement prepared for future instrumentation. */
export interface ApiRequestMeasurement {
  readonly method: string;
  readonly route: string;
  readonly statusCode: number;
  readonly durationMs: number;
  readonly requestBytes?: number;
  readonly responseBytes?: number;
}

/** Transport metrics boundary; implementations must not retain sensitive data. */
export interface MetricsRecorder {
  recordRequest(measurement: ApiRequestMeasurement): void;
}

/** Default no-op recorder used until a metrics backend is approved. */
export const noOpMetricsRecorder: MetricsRecorder = Object.freeze({
  recordRequest: () => undefined,
});
