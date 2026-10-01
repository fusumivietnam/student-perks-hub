import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

function run(args, options = {}) {
  const result = spawnSync("pnpm", ["exec", "supabase", ...args], {
    encoding: "utf8",
    ...options,
  });

  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  return result;
}

const isCodespaces = process.env.CODESPACES === "true";
const forwardingDomain =
  process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN ?? "app.github.dev";
const codespaceName = process.env.CODESPACE_NAME;

if (isCodespaces && !codespaceName) {
  throw new Error("CODESPACE_NAME is required inside GitHub Codespaces.");
}

const appUrl = isCodespaces
  ? `https://${codespaceName}-3000.${forwardingDomain}`
  : "http://127.0.0.1:3000";

writeFileSync(
  ".env",
  `SUPABASE_AUTH_SITE_URL=${appUrl}\n`,
  "utf8",
);

console.log("Starting local Supabase...");
run(["start"], { stdio: "inherit" });

const status = run(["status", "-o", "env"]);
const values = Object.fromEntries(
  status.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([A-Z0-9_]+)=(?:"(.*)"|(.*))$/);
      return match ? [match[1], match[2] ?? match[3] ?? ""] : null;
    })
    .filter(Boolean),
);

const internalUrl = values.API_URL ?? "http://127.0.0.1:54321";
const publishableKey = values.PUBLISHABLE_KEY ?? values.ANON_KEY;

if (!publishableKey) {
  throw new Error(
    "Could not read PUBLISHABLE_KEY or ANON_KEY from Supabase local status.",
  );
}

const publicUrl = isCodespaces ? `${appUrl}/supabase` : internalUrl;

writeFileSync(
  ".env.local",
  [
    `NEXT_PUBLIC_SUPABASE_URL=${publicUrl}`,
    `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishableKey}`,
    `SUPABASE_INTERNAL_URL=${internalUrl}`,
    "",
  ].join("\n"),
  "utf8",
);

console.log("");
console.log("Local environment is ready.");
console.log(`App URL:      ${appUrl}`);
console.log(
  `Supabase API: ${isCodespaces ? "proxied through /supabase" : internalUrl}`,
);
console.log("");
console.log("Run pnpm dev to start Next.js.");
