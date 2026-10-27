import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
export function validateSyntheticEvidence(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw Error("Evidence object required");
  const required = {schemaVersion:1,kind:"managed-state-recovery-rehearsal",target:"ephemeral-local-supabase",productionDataCopied:false,productionSecretsUsed:false,productionRecoveryReady:false,originalIdentityPreserved:false,authRecoveryMode:"forced-reauth-reprovision",storageRecoveryMode:"provider-api-object-reupload"};
  for (const [name, expected] of Object.entries(required)) if(v[name] !== expected) throw Error("Invalid evidence field "+name);
  if (typeof v.verifiedAt !== "string" || !Number.isFinite(Date.parse(v.verifiedAt)) || new Date(v.verifiedAt).toISOString() !== v.verifiedAt) throw Error("Invalid timestamp");
  if (!v.checks || typeof v.checks !== "object" || Array.isArray(v.checks)) throw Error("Missing checks");
  for(const key of ["initialAuthSignIn","authLossSimulated","recoveredAuthSignIn","initialStorageChecksum","storageLossSimulated","restoredStorageChecksum"]) if(v.checks[key] !== true) throw Error("Missing check "+key);
  if(!Array.isArray(v.limitations) || !v.limitations.includes("does-not-prove-preservation-of-original-auth-user-id-or-password-hash") || !v.limitations.includes("does-not-prove-provider-configuration-rebuild")) throw Error("Missing limitations");
  return true;
}
if(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if(!process.argv[2]) throw Error("Evidence file required");
  validateSyntheticEvidence(JSON.parse(readFileSync(process.argv[2],"utf8")));
  console.log("Synthetic evidence validated; Production readiness NOT established.");
}
