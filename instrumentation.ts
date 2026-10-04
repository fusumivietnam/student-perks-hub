import type { Instrumentation } from "next";

import { getReleaseContext } from "./lib/release-context";

function requestPathWithoutQuery(path: string) {
  return path.split("?", 1)[0] || "/";
}

function getErrorName(error: unknown) {
  return error instanceof Error ? error.name : "UnknownError";
}

function getErrorDigest(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string"
  ) {
    return error.digest;
  }

  return null;
}

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const release = getReleaseContext();

  console.error(
    JSON.stringify({
      event: "server_error",
      errorName: getErrorName(error),
      digest: getErrorDigest(error),
      method: request.method,
      path: requestPathWithoutQuery(request.path),
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      environment: release.environment,
      releaseSha: release.releaseSha,
      deploymentId: release.deploymentId,
      region: release.region,
    }),
  );
};
