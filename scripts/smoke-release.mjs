import { writeFileSync } from "node:fs";

const deploymentUrl = process.env.DEPLOYMENT_URL;
const environment = process.env.RELEASE_ENVIRONMENT;
const releaseSha = process.env.RELEASE_SHA;
const workflowRunId = process.env.GITHUB_RUN_ID;
const workflowRunAttempt = process.env.GITHUB_RUN_ATTEMPT;
const repository = process.env.GITHUB_REPOSITORY;
const serverUrl = process.env.GITHUB_SERVER_URL ?? "https://github.com";
const migrationState = process.env.MIGRATION_STATE ?? "not-recorded";
const migrationLocalHead = process.env.MIGRATION_LOCAL_HEAD ?? null;
const migrationRemoteHead = process.env.MIGRATION_REMOTE_HEAD ?? null;
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const canonicalProductionUrl = (
  process.env.CANONICAL_PRODUCTION_URL ??
  "https://student-perks-hub-fusumivietnam.vercel.app"
).replace(/\/$/, "");

if (!deploymentUrl) throw new Error("DEPLOYMENT_URL is required.");
if (!environment) throw new Error("RELEASE_ENVIRONMENT is required.");
if (!releaseSha) throw new Error("RELEASE_SHA is required.");
if (!/^[0-9a-f]{40}$/i.test(releaseSha)) {
  throw new Error("RELEASE_SHA must be a full 40-character Git SHA.");
}

const immutableDeploymentUrl = deploymentUrl.replace(/\/$/, "");

const headers = bypassSecret
  ? {
      "x-vercel-protection-bypass": bypassSecret,
      "x-vercel-set-bypass-cookie": "true",
    }
  : {};

async function fetchHealth(baseUrl, label) {
  const url = `${baseUrl}/api/health`;
  const startedAt = Date.now();
  const response = await fetch(url, {
    redirect: "follow",
    headers,
    cache: "no-store",
  });
  const elapsedMs = Date.now() - startedAt;

  if (response.status !== 200) {
    throw new Error(
      `${label} health failed: expected 200, got ${response.status}`,
    );
  }

  const payload = await response.json();
  if (payload?.status !== "ok") {
    throw new Error(`${label} health did not report status=ok.`);
  }
  if (payload?.service !== "student-perks-hub") {
    throw new Error(`${label} health reported an unexpected service.`);
  }
  if (payload?.environment !== environment) {
    throw new Error(
      `${label} health environment mismatch: expected ${environment}, got ${payload?.environment ?? "missing"}`,
    );
  }
  if (payload?.release !== releaseSha) {
    throw new Error(
      `${label} health release mismatch: expected ${releaseSha}, got ${payload?.release ?? "missing"}`,
    );
  }
  if (typeof payload?.deployment !== "string" || !payload.deployment.startsWith("dpl_")) {
    throw new Error(`${label} health is missing a valid Vercel deployment ID.`);
  }

  return {
    url,
    status: response.status,
    elapsedMs,
    release: payload.release,
    deploymentId: payload.deployment,
    region: payload.region ?? null,
    timestamp: payload.timestamp ?? null,
  };
}

async function fetchStatus(baseUrl, name, path) {
  const url = baseUrl + path;
  const startedAt = Date.now();
  const response = await fetch(url, {
    redirect: "follow",
    headers,
    cache: "no-store",
  });
  const elapsedMs = Date.now() - startedAt;
  const result = {
    name,
    url,
    status: response.status,
    expectedStatus: 200,
    elapsedMs,
    ok: response.status === 200,
  };

  if (!result.ok) {
    throw new Error(
      `Smoke check failed for ${name}: expected 200, got ${response.status}`,
    );
  }

  return result;
}

const immutableHealth = await fetchHealth(
  immutableDeploymentUrl,
  "immutable deployment",
);
const canonicalHealth = await fetchHealth(
  canonicalProductionUrl,
  "canonical Production alias",
);

if (canonicalHealth.deploymentId !== immutableHealth.deploymentId) {
  throw new Error(
    `Canonical Production alias is stale: immutable deployment is ${immutableHealth.deploymentId}, canonical alias is ${canonicalHealth.deploymentId}.`,
  );
}

const checks = [
  {
    name: "immutable-health",
    url: immutableHealth.url,
    status: immutableHealth.status,
    expectedStatus: 200,
    elapsedMs: immutableHealth.elapsedMs,
    ok: true,
  },
  {
    name: "canonical-health",
    url: canonicalHealth.url,
    status: canonicalHealth.status,
    expectedStatus: 200,
    elapsedMs: canonicalHealth.elapsedMs,
    ok: true,
  },
  await fetchStatus(immutableDeploymentUrl, "immutable-home", "/"),
  await fetchStatus(canonicalProductionUrl, "canonical-home", "/"),
  await fetchStatus(
    canonicalProductionUrl,
    "canonical-published-offer",
    "/offers/github-student-developer-pack",
  ),
];

const runUrl =
  repository && workflowRunId
    ? `${serverUrl}/${repository}/actions/runs/${workflowRunId}`
    : null;

const evidence = {
  schemaVersion: 2,
  kind: "protected-production-release",
  environment,
  releaseSha,
  deploymentId: immutableHealth.deploymentId,
  deploymentUrl: immutableDeploymentUrl,
  canonicalProductionUrl,
  canonicalReleaseSha: canonicalHealth.release,
  canonicalDeploymentId: canonicalHealth.deploymentId,
  workflow: {
    repository: repository ?? null,
    runId: workflowRunId ?? null,
    runAttempt: workflowRunAttempt ?? null,
    runUrl,
  },
  migration: {
    state: migrationState,
    localHead: migrationLocalHead,
    remoteHead: migrationRemoteHead,
  },
  health: {
    immutable: immutableHealth,
    canonical: canonicalHealth,
  },
  verifiedAt: new Date().toISOString(),
  checks,
};

writeFileSync(
  "release-evidence.json",
  JSON.stringify(evidence, null, 2) + "\n",
  "utf8",
);

console.log(JSON.stringify(evidence, null, 2));
