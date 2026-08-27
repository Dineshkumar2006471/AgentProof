export const BETA_RUN_WINDOW_MS = 24 * 60 * 60 * 1000;

export function countRunsInWindow(
  runs: Array<{ startedAt: string }>,
  now = Date.now()
) {
  const windowStart = now - BETA_RUN_WINDOW_MS;
  return runs.filter((run) => Date.parse(run.startedAt) >= windowStart).length;
}
