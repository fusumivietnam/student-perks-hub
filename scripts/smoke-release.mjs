import { writeFileSync } from "node:fs";

const baseUrl = process.env.DEPLOYMENT_URL;
const environment = process.env.RELEASE_ENVIRONMENT;
const releaseSha = process.env.RELEASE_SHA;
const workflowRunId = process.env.GITHUB_RUN_ID;
const migrationState = process.env.MIGRATION_STATE ?? "not-recorded";
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

if (!baseUrl) throw new Error("DEPLOYMENT_URL is required.");
if (!environment) throw new Error("RELEASE_ENVIRONMENT is required.");
if (!releaseSha) throw new Error("RELEASE_SHA is required.");

const normalized = baseUrl.replace(/\/$/, "");

const headers = bypassSecret
  ? {
      "x-vercel-protection-bypass": bypassSecret,
      "x-vercel-set-bypass-cookie": "true",
    }
  : {};

const checks = [
  { name: "health", path: "/api/health", expectedStatus: 200 },
  { name: "home", path: "/", expectedStatus: 200 },
  {
    name: "published-offer",
    path: "/offers/github-student-developer-pack",
    expectedStatus: 200,
  },
];

const results = [];

for (const check of checks) {
  const url = normalized + check.path;
  const startedAt = Date.now();
  const response = await fetch(url, {
    redirect: "follow",
    headers,
  });
  const elapsedMs = Date.now() - startedAt;

  results.push({
    name: check.name,
    url,
    status: response.status,
    expectedStatus: check.expectedStatus,
    elapsedMs,
    ok: response.status === check.expectedStatus,
  });

  if (response.status !== check.expectedStatus) {
    throw new Error(
      `Smoke check failed for ${check.name}: expected ${check.expectedStatus}, got ${response.status}`,
    );
  }
}

const evidence = {
  environment,
  releaseSha,
  deploymentUrl: normalized,
  workflowRunId: workflowRunId ?? null,
  migrationState,
  verifiedAt: new Date().toISOString(),
  checks: results,
};

writeFileSync(
  "release-evidence.json",
  JSON.stringify(evidence, null, 2) + "\n",
  "utf8",
);

console.log(JSON.stringify(evidence, null, 2));
