import { appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const email = "e2e@student-perks.local";
const password = "Playwright-E2E-2026!";

const status = spawnSync(
  "pnpm",
  ["exec", "supabase", "status", "-o", "env"],
  { encoding: "utf8" },
);

if (status.status !== 0) {
  if (status.stderr) process.stderr.write(status.stderr);
  process.exit(status.status ?? 1);
}

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

const apiUrl = values.API_URL ?? "http://127.0.0.1:54321";
const serviceKey = values.SECRET_KEY ?? values.SERVICE_ROLE_KEY;

if (!serviceKey) {
  throw new Error("Could not read local Supabase service-role/secret key.");
}

const adminHeaders = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

const usersResponse = await fetch(`${apiUrl}/auth/v1/admin/users?per_page=100`, {
  headers: adminHeaders,
});

if (!usersResponse.ok) {
  throw new Error(
    `Could not list local Supabase users: ${usersResponse.status}`,
  );
}

const usersPayload = await usersResponse.json();
const existing = (usersPayload.users ?? []).find((user) => user.email === email);

if (existing) {
  const deleteResponse = await fetch(
    `${apiUrl}/auth/v1/admin/users/${existing.id}`,
    { method: "DELETE", headers: adminHeaders },
  );

  if (!deleteResponse.ok) {
    throw new Error(`Could not reset E2E user: ${deleteResponse.status}`);
  }
}

const createResponse = await fetch(`${apiUrl}/auth/v1/admin/users`, {
  method: "POST",
  headers: adminHeaders,
  body: JSON.stringify({ email, password, email_confirm: true }),
});

if (!createResponse.ok) {
  const detail = await createResponse.text();
  throw new Error(
    `Could not create E2E user: ${createResponse.status} ${detail}`,
  );
}

if (process.env.GITHUB_ENV) {
  appendFileSync(
    process.env.GITHUB_ENV,
    [
      `E2E_SUPABASE_URL=${apiUrl}`,
      `E2E_SERVICE_ROLE_KEY=${serviceKey}`,
      `E2E_TEST_EMAIL=${email}`,
      `E2E_TEST_PASSWORD=${password}`,
      "",
    ].join("\n"),
  );
}

console.log("E2E test user is ready.");
