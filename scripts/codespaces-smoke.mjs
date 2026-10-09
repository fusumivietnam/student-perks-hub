import { execFileSync } from "node:child_process";

function run(command, args = []) {
  return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function fail(message) {
  console.error(`Codespaces smoke failed: ${message}`);
  process.exit(1);
}

const expectedNode = run("bash", ["-lc", "tr -d '[:space:]' < .nvmrc"]);
const currentNode = process.version.replace(/^v/, "");
if (currentNode !== expectedNode) fail(`Node ${expectedNode} required; found ${currentNode}`);

const expectedPnpm = JSON.parse(run("cat", ["package.json"])).packageManager?.replace(/^pnpm@/, "");
const currentPnpm = run("pnpm", ["--version"]);
if (!expectedPnpm || currentPnpm !== expectedPnpm) {
  fail(`pnpm ${expectedPnpm ?? "from packageManager"} required; found ${currentPnpm}`);
}

try {
  run("docker", ["info"]);
} catch {
  fail("Docker daemon is not ready");
}

let status;
try {
  status = run("pnpm", ["local:status"]);
} catch (error) {
  console.error(error?.stderr?.toString?.() ?? "");
  fail("local Supabase is not healthy; run pnpm local:start");
}

for (const port of [54321, 54322, 54323, 54324, 54327, 54329]) {
  if (!status.includes(String(port))) {
    console.warn(`Codespaces smoke warning: Supabase status did not print expected port ${port}`);
  }
}

let response;
try {
  response = await fetch("http://127.0.0.1:3000/api/health", { signal: AbortSignal.timeout(5000) });
} catch {
  fail("Next.js is not reachable on port 3000");
}

if (!response.ok) fail(`/api/health returned HTTP ${response.status}`);
const payload = await response.json().catch(() => null);
if (!payload || payload.status !== "ok") fail("/api/health did not return status=ok");

console.log("Codespaces smoke passed");
console.log(`Node ${currentNode}; pnpm ${currentPnpm}; Docker ready; Supabase reachable; Next.js healthy`);
console.log("Verify the Codespaces Ports panel keeps 54321/54322/54323/54324/54327/54329 private.");
