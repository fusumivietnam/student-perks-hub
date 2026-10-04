export type ReleaseContext = {
  environment: string;
  releaseSha: string;
  deploymentId: string;
  region: string;
};

function valueOrFallback(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

export function getReleaseContext(): ReleaseContext {
  return {
    environment: valueOrFallback(
      process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      "unknown",
    ),
    releaseSha: valueOrFallback(
      process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA,
      "local",
    ),
    deploymentId: valueOrFallback(process.env.VERCEL_DEPLOYMENT_ID, "local"),
    region: valueOrFallback(process.env.VERCEL_REGION, "local"),
  };
}
