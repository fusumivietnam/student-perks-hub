# Security Policy

## Reporting a vulnerability

Do not disclose suspected vulnerabilities in a public issue.

Use GitHub's private vulnerability reporting / security advisory channel for this repository when available. If private reporting is unavailable, contact the repository owner through a private channel.

Include:

- affected component;
- reproduction steps;
- expected impact;
- any proof of concept necessary to demonstrate the issue.

Do not include real user data, production credentials, or unnecessary sensitive data.

## Scope

Security-sensitive areas include:

- authentication and session handling;
- Supabase RLS and authorization;
- admin access;
- service-role credentials and secrets;
- database migrations affecting access control or integrity;
- external callbacks/webhooks;
- dependency vulnerabilities.

## Response

Security fixes require human review. The repository's CI Gate and CodeQL protections must not be bypassed for a security patch except through an explicitly documented emergency process.
