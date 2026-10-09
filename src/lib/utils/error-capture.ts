export function captureClientError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[Client Error]", error, context);
  }
}
