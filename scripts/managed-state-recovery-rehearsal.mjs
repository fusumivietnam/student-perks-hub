import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { encoding: "utf8", ...options });
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  return result.stdout.trim();
}

function parseEnv(text) {
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^([A-Z0-9_]+)=(?:"(.*)"|(.*))$/);
        return match ? [match[1], match[2] ?? match[3] ?? ""] : null;
      })
      .filter(Boolean),
  );
}

async function request(url, { method = "GET", key, body, headers = {} } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...headers,
    },
    body,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Local managed-state API request failed: ${method} ${response.status}`);
  }
  return text ? JSON.parse(text) : null;
}

const status = parseEnv(run("pnpm", ["exec", "supabase", "status", "-o", "env"]));
const apiUrl = status.API_URL ?? "http://127.0.0.1:54321";
const endpoint = new URL(apiUrl);
// This rehearsal creates/deletes identities and objects. Never let CLI context
// switching or a misconfigured URL make the fixture operate on a remote project.
if (
  endpoint.protocol !== "http:" ||
  !["127.0.0.1", "localhost", "::1", "[::1]"].includes(endpoint.hostname) ||
  endpoint.username ||
  endpoint.password
) {
  throw new Error("Managed-state rehearsal requires a local loopback Supabase API.");
}
const serviceRoleKey = status.SERVICE_ROLE_KEY ?? status.SECRET_KEY;
if (!serviceRoleKey) throw new Error("Could not resolve local Supabase service-role/secret key.");

const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
const email = `managed-recovery-${suffix}@example.invalid`;
const initialPassword = `Initial-${suffix}-A1!`;
const recoveryPassword = `Recovery-${suffix}-B2!`;
const bucket = `managed-recovery-${suffix}`;
const objectPath = "probe.txt";
const payload = Buffer.from(`managed-state-recovery-${suffix}\n`, "utf8");
const expectedSha256 = createHash("sha256").update(payload).digest("hex");

let firstUserId;
let recoveredUserId;
try {
  const created = await request(`${apiUrl}/auth/v1/admin/users`, {
    method: "POST",
    key: serviceRoleKey,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: initialPassword, email_confirm: true }),
  });
  firstUserId = created.id;
  if (!firstUserId) throw new Error("Auth Admin API did not return a user id.");

  const firstSession = await request(`${apiUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    key: serviceRoleKey,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: initialPassword }),
  });
  if (!firstSession?.access_token) throw new Error("Initial sign-in verification failed.");

  await request(`${apiUrl}/storage/v1/bucket`, {
    method: "POST",
    key: serviceRoleKey,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: bucket, name: bucket, public: false }),
  });

  const upload = await fetch(`${apiUrl}/storage/v1/object/${bucket}/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "text/plain",
      "x-upsert": "true",
    },
    body: payload,
  });
  if (!upload.ok) throw new Error(`Local Storage fixture upload failed: ${upload.status}`);

  const downloaded = await fetch(`${apiUrl}/storage/v1/object/${bucket}/${objectPath}`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
  });
  if (!downloaded.ok) throw new Error(`Storage download failed: ${downloaded.status}`);
  const initialBytes = Buffer.from(await downloaded.arrayBuffer());
  if (createHash("sha256").update(initialBytes).digest("hex") !== expectedSha256) {
    throw new Error("Initial Storage object checksum mismatch.");
  }

  const removeObject = await fetch(`${apiUrl}/storage/v1/object/${bucket}/${objectPath}`, {
    method: "DELETE",
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
  });
  if (!removeObject.ok) throw new Error(`Storage delete failed: ${removeObject.status}`);
  await request(`${apiUrl}/auth/v1/admin/users/${firstUserId}`, {
    method: "DELETE",
    key: serviceRoleKey,
  });

  const recovered = await request(`${apiUrl}/auth/v1/admin/users`, {
    method: "POST",
    key: serviceRoleKey,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: recoveryPassword, email_confirm: true }),
  });
  recoveredUserId = recovered.id;
  if (!recoveredUserId) throw new Error("Recovered Auth user was not created.");

  const recoveredSession = await request(`${apiUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    key: serviceRoleKey,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: recoveryPassword }),
  });
  if (!recoveredSession?.access_token) throw new Error("Forced re-auth sign-in verification failed.");

  const restoreObject = await fetch(`${apiUrl}/storage/v1/object/${bucket}/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "text/plain",
      "x-upsert": "true",
    },
    body: payload,
  });
  if (!restoreObject.ok) throw new Error(`Storage restore upload failed: ${restoreObject.status}`);

  const restored = await fetch(`${apiUrl}/storage/v1/object/${bucket}/${objectPath}`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
  });
  if (!restored.ok) throw new Error(`Restored Storage download failed: ${restored.status}`);
  const restoredBytes = Buffer.from(await restored.arrayBuffer());
  const restoredSha256 = createHash("sha256").update(restoredBytes).digest("hex");
  if (restoredSha256 !== expectedSha256) throw new Error("Restored Storage object checksum mismatch.");

  const evidence = {
    schemaVersion: 1,
    kind: "managed-state-recovery-rehearsal",
    target: "ephemeral-local-supabase",
    productionDataCopied: false,
    productionSecretsUsed: false,
    authRecoveryMode: "forced-reauth-reprovision",
    originalIdentityPreserved: false,
    productionRecoveryReady: false,
    storageRecoveryMode: "provider-api-object-reupload",
    verifiedAt: new Date().toISOString(),
    checks: {
      initialAuthSignIn: true,
      authLossSimulated: true,
      recoveredAuthSignIn: true,
      initialStorageChecksum: true,
      storageLossSimulated: true,
      restoredStorageChecksum: true,
    },
    limitations: [
      "does-not-prove-preservation-of-original-auth-user-id-or-password-hash",
      "does-not-prove-remote-managed-backup-or-pitr",
      "simulated-reprovision-only-not-a-restoration-of-the-original-auth-identity",
      "does-not-prove-provider-configuration-rebuild",
    ],
  };
  writeFileSync("managed-state-recovery-evidence.json", `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(evidence));
} finally {
  if (recoveredUserId) {
    try { await request(`${apiUrl}/auth/v1/admin/users/${recoveredUserId}`, { method: "DELETE", key: serviceRoleKey }); } catch {}
  } else if (firstUserId) {
    try { await request(`${apiUrl}/auth/v1/admin/users/${firstUserId}`, { method: "DELETE", key: serviceRoleKey }); } catch {}
  }
  try {
    await fetch(`${apiUrl}/storage/v1/object/${bucket}/${objectPath}`, {
      method: "DELETE",
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    });
    await request(`${apiUrl}/storage/v1/bucket/${bucket}`, { method: "DELETE", key: serviceRoleKey });
  } catch {}
}
