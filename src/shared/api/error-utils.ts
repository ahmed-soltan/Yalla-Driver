function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getErrorStatus(error: unknown): number | null {
  if (!isRecord(error)) return null;

  if (typeof error.status === 'number') return error.status;

  const response = error.response;
  if (isRecord(response) && typeof response.status === 'number') {
    return response.status;
  }

  return null;
}
