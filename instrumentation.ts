import type { Instrumentation } from "next";

import { getReleaseContext } from "./lib/release-context";

function requestPathWithoutQuery(path: string) {
  return path.split("?", 1)[0] || "/";
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
      errorName: error.name,
      digest: error.digest || null,
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
