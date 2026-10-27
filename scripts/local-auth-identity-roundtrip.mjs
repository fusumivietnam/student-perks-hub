import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function command(bin, args, env = process.env) {
  const out = spawnSync(bin, args, { encoding: "utf8", env });
  if (out.status !== 0) {
    // Emit only a non-sensitive error category, never PostgreSQL output containing URLs or Auth data.
    const stderr = out.stderr || "";
    const category = /server version.*pg_dump version|aborting because of server version mismatch/i.test(stderr)
      ? "postgres-client-server-version-mismatch"
      : /permission denied|must be owner/i.test(stderr) ? "database-permission-denied"
      : /connection refused|could not connect/i.test(stderr) ? "local-database-connection-failed"
      : /not found|ENOENT/i.test(stderr) ? "postgres-client-unavailable"
      : "unclassified-postgresql-command-failure";
    throw Error("Local Auth recovery command failed: " + bin + " (" + category + ", exit=" + out.status + ")");
  }
  return out.stdout.trim();
}
const status = Object.fromEntries(command("pnpm", ["exec", "supabase", "status", "-o", "env"])
  .split(/\r?\n/).map(x => x.match(/^([A-Z0-9_]+)=(?:"(.*)"|(.*))$/))
  .filter(Boolean).map(m => [m[1],m[2] ?? m[3] ?? ""]));
const url = new URL(status.API_URL ?? "http://127.0.0.1:54321");
const db = new URL(status.DB_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres");
if (url.protocol !== "http:" || !["localhost","127.0.0.1"].includes(url.hostname)
 || !["localhost","127.0.0.1"].includes(db.hostname)) throw Error("Only loopback local Supabase is allowed");
const key = status.SERVICE_ROLE_KEY ?? status.SECRET_KEY;
if (!key) throw Error("Local service key unavailable");
const base = url.origin;
const suffix = randomUUID().slice(0, 12);
const email = "identity-restore-" + suffix + "@example.invalid";
const password = "Fixture-" + suffix + "-A1!";
const temp = mkdtempSync(join(tmpdir(), "auth-identity-roundtrip-"));
let id;
async function api(path, method, payload, authKey = key) {
  const response = await fetch(base + path,{ method,
    headers: { apikey:key, Authorization:"Bearer " + authKey, "Content-Type":"application/json" },
    body:payload ? JSON.stringify(payload) : undefined });
  if (!response.ok) throw Error("Local Auth endpoint failed: " + response.status);
  return response.json();
}
async function login() {
  const response = await fetch(base + "/auth/v1/token?grant_type=password", {
    method:"POST", headers:{apikey:key,"Content-Type":"application/json"},
    body:JSON.stringify({email,password}) });
  if (!response.ok) throw Error("Restored user cannot authenticate");
  const json = await response.json();
  if (json.user?.id !== id) throw Error("Original user ID was not preserved");
  return true;
}
try {
  const created = await api("/auth/v1/admin/users","POST",{email,password,email_confirm:true});
  id=created.id;
  if (!id) throw Error("Missing synthetic Auth ID");
  await login();
  // Dump original Auth rows in private ephemeral filesystem. No raw SQL is published.
  const dump = join(temp,"identity.sql");
  command("pg_dump",["--data-only","--column-inserts","--no-owner","--no-privileges",
    "--table=auth.users","--table=auth.identities","--file="+dump,db.toString()]);
  await api("/auth/v1/admin/users/"+id,"DELETE");
  command("psql",[db.toString(),"--no-psqlrc","-v","ON_ERROR_STOP=1","--single-transaction","-f",dump]);
  await login();
  console.log(JSON.stringify({
    kind:"local-auth-original-identity-roundtrip",verifiedAt:new Date().toISOString(),
    target:"local-loopback-supabase",productionDataCopied:false,
    originalIdentityPreserved:true,originalPasswordStillAuthenticates:true,
    productionRecoveryReady:false,
    limitations:["same-local-database-not-clean-project-restore","not-a-production-auth-backup-or-provider-config-rehearsal"]
  }));
} finally {
  if(id) { try { await api("/auth/v1/admin/users/"+id,"DELETE"); } catch {} }
  rmSync(temp,{recursive:true,force:true});
}
