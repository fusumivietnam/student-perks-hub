import { writeFileSync } from "node:fs";

const baseUrl = (
  process.env.PRODUCTION_URL ??
  "https://student-perks-hub-fusumivietnam.vercel.app"
).replace(/\/$/, "");

const routes = [
  { name: "home", path: "/" },
  { name: "offers", path: "/offers" },
  { name: "search", path: "/search" },
  { name: "login", path: "/login" },
  { name: "forgot-password", path: "/forgot-password" },
  { name: "account-guard", path: "/account" },
  { name: "auth-callback-fail-closed", path: "/auth/callback?next=/reset-password" },
];

async function checkRoute({ name, path }) {
  const startedAt = Date.now();
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      redirect: "follow",
      cache: "no-store",
      headers: {
        "user-agent": "student-perks-hub-production-smoke/1.0",
      },
    });

    return {
      name,
      path,
      status: response.status,
      elapsedMs: Date.now() - startedAt,
      ok: response.status === 200,
    };
  } catch (error) {
    return {
      name,
      path,
      status: null,
      elapsedMs: Date.now() - startedAt,
      ok: false,
      error: error instanceof Error ? error.name : "request-error",
    };
  }
}

const checks = [];
for (const route of routes) {
  checks.push(await checkRoute(route));
}

const healthy = checks.every((check) => check.ok);
const evidence = {
  schemaVersion: 1,
  kind: "production-synthetic-smoke",
  target: baseUrl,
  verifiedAt: new Date().toISOString(),
  healthy,
  checks,
};

writeFileSync(
  "production-smoke-evidence.json",
  JSON.stringify(evidence, null, 2) + "\n",
  "utf8",
);

console.log(JSON.stringify(evidence, null, 2));
process.exitCode = healthy ? 0 : 1;
