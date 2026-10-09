import { spawnSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

function runSupabase(args, { allowFailure = false } = {}) {
  const result = spawnSync("pnpm", ["exec", "supabase", ...args], {
    stdio: "inherit",
  });

  if (result.status !== 0 && !allowFailure) {
    throw new Error(
      `Supabase CLI failed (${result.status ?? "unknown"}): ${args.join(" ")}`,
    );
  }

  return result.status === 0;
}

export async function startSupabase(args, { label = "Supabase", attempts = 3 } = {}) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    console.log(`${label}: startup attempt ${attempt}/${attempts}`);

    // GitHub-hosted runners are ephemeral, but a previous/partial Supabase
    // startup can still leave project containers bound to the default ports.
    // Clear only this project's local Supabase stack before every attempt.
    runSupabase(["stop", "--no-backup"], { allowFailure: true });

    if (runSupabase(args, { allowFailure: true })) {
      console.log(`${label}: startup succeeded.`);
      return;
    }

    if (attempt < attempts) {
      const delayMs = attempt * 5_000;
      console.warn(
        `${label}: startup failed; cleaning up and retrying in ${delayMs / 1000}s.`,
      );
      runSupabase(["stop", "--no-backup"], { allowFailure: true });
      await sleep(delayMs);
    }
  }

  throw new Error(`${label}: startup failed after ${attempts} attempts.`);
}

if (process.argv[2] === "db") {
  await startSupabase(["db", "start"], { label: "Local Postgres" });
}
