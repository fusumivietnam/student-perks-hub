import { getReleaseContext } from "@/lib/release-context";

export const dynamic = "force-dynamic";

export function GET() {
  const release = getReleaseContext();

  return Response.json(
    {
      status: "ok",
      service: "student-perks-hub",
      environment: release.environment,
      release: release.releaseSha,
      deployment: release.deploymentId,
      region: release.region,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
