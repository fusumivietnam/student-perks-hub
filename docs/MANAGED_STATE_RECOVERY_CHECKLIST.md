# Managed-state recovery checklist

Use this checklist before any Production Auth/Storage recovery path is treated as operationally ready. The current synthetic rehearsal proves local recovery mechanics only; it does not authorize relaxing the Production fail-closed guard.

## Auth

- Confirm the selected recovery model: managed restore/PITR or forced re-authentication/reprovision.
- Record expected user-ID continuity semantics.
- Record password-hash/session continuity semantics.
- Verify post-recovery sign-in behavior on a safe non-Production target.
- Verify callback URLs, site URL, redirect allow-list and recovery redirects.
- Verify enabled identity providers and provider-specific configuration.
- Verify SMTP sender/domain/template configuration where applicable.
- Verify MFA policy and any provider-side MFA dependencies where applicable.

## Storage

- Identify every Production bucket and its intended public/private policy.
- Back up and restore object bytes separately from database metadata.
- Verify bucket definitions and access policies.
- Verify representative object checksums after restore.
- Verify signed/public URL behavior after restore.
- Verify lifecycle/size/MIME restrictions if configured.

## Provider and project configuration

- Record project region and project reference used by the recovered environment.
- Recreate Auth site URL and redirect configuration.
- Recreate OAuth/provider configuration without storing provider secrets in this repository.
- Recreate SMTP configuration without storing credentials in this repository.
- Recreate Edge Functions and verify required secrets are injected from approved secret stores.
- Recreate custom domains and DNS bindings where applicable.
- Recreate webhook/integration configuration where applicable.
- Rotate/re-issue API keys or other credentials when the incident model requires it.
- Verify Vercel Production environment variables reference the recovered Supabase project only after human review.

## Evidence contract

A reviewed rehearsal must emit non-sensitive evidence containing:

- workflow/run identity and exact commit SHA;
- rehearsal timestamp and target class;
- selected Auth and Storage recovery modes;
- pass/fail checks for Auth behavior and Storage object-byte integrity;
- explicit limitations;
- no Auth rows, emails, Storage paths, database URLs, tokens, passwords, raw backups, or provider secrets.

The evidence artifact must have an integrity digest and a finite retention policy. A successful local rehearsal is necessary but not sufficient to prove remote Production recoverability.
