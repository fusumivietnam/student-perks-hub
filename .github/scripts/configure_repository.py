#!/usr/bin/env python3
import json
import os
import urllib.error
import urllib.request

API = "https://api.github.com"
TOKEN = os.environ["PROJECT_TOKEN"]
REPOSITORY = os.environ["GITHUB_REPOSITORY"]
API_VERSION = "2026-03-10"

HEADERS = {
    "Accept": "application/vnd.github+json",
    "Authorization": f"Bearer {TOKEN}",
    "X-GitHub-Api-Version": API_VERSION,
    "User-Agent": "student-perks-hub-governance",
}


def request(method, path, payload=None, allow_empty=False):
    url = f"{API}/{path.lstrip('/')}"
    data = None
    headers = dict(HEADERS)
    if payload is not None:
        data = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            raw = response.read().decode()
            if not raw:
                return None if allow_empty else {}
            return json.loads(raw)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode()
        raise RuntimeError(f"{method} {url} failed: {exc.code} {body}") from exc


def configure_repository():
    request(
        "PATCH",
        f"repos/{REPOSITORY}",
        {
            "allow_squash_merge": True,
            "allow_merge_commit": False,
            "allow_rebase_merge": False,
            "allow_auto_merge": True,
            "delete_branch_on_merge": True,
            "allow_update_branch": True,
            "squash_merge_commit_title": "PR_TITLE",
            "squash_merge_commit_message": "PR_BODY",
        },
    )
    print("configured merge policy and automatic branch cleanup")


def configure_security():
    for endpoint, label in [
        (f"repos/{REPOSITORY}/vulnerability-alerts", "Dependabot alerts"),
        (f"repos/{REPOSITORY}/automated-security-fixes", "Dependabot security updates"),
    ]:
        try:
            request("PUT", endpoint, allow_empty=True)
            print(f"enabled {label}")
        except RuntimeError as exc:
            print(f"warning: could not enable {label}: {exc}")

    try:
        request(
            "PATCH",
            f"repos/{REPOSITORY}",
            {
                "security_and_analysis": {
                    "secret_scanning": {"status": "enabled"},
                    "secret_scanning_push_protection": {"status": "enabled"},
                }
            },
        )
        print("enabled secret scanning and push protection")
    except RuntimeError as exc:
        print(f"warning: could not enable secret scanning settings: {exc}")


def ruleset_payload():
    return {
        "name": "Protect main",
        "target": "branch",
        "enforcement": "active",
        "conditions": {
            "ref_name": {
                "include": ["~DEFAULT_BRANCH"],
                "exclude": [],
            }
        },
        "rules": [
            {"type": "deletion"},
            {"type": "non_fast_forward"},
            {"type": "required_linear_history"},
            {
                "type": "pull_request",
                "parameters": {
                    "allowed_merge_methods": ["squash"],
                    "dismiss_stale_reviews_on_push": True,
                    "require_code_owner_review": False,
                    "require_last_push_approval": False,
                    "required_approving_review_count": 0,
                    "required_review_thread_resolution": True,
                },
            },
            {
                "type": "required_status_checks",
                "parameters": {
                    "do_not_enforce_on_create": True,
                    "required_status_checks": [
                        {"context": "verify"},
                        {"context": "Analyze JavaScript/TypeScript"},
                    ],
                    "strict_required_status_checks_policy": True,
                },
            },
        ],
        "bypass_actors": [],
    }


def configure_ruleset():
    rulesets = request("GET", f"repos/{REPOSITORY}/rulesets")
    existing = next((r for r in rulesets if r.get("name") == "Protect main"), None)
    payload = ruleset_payload()

    if existing:
        request("PUT", f"repos/{REPOSITORY}/rulesets/{existing['id']}", payload)
        print(f"updated ruleset Protect main ({existing['id']})")
    else:
        created = request("POST", f"repos/{REPOSITORY}/rulesets", payload)
        print(f"created ruleset Protect main ({created.get('id')})")


def main():
    if not TOKEN:
        raise RuntimeError("PROJECT_TOKEN is missing.")
    configure_repository()
    configure_security()
    configure_ruleset()
    print("repository governance configured")


if __name__ == "__main__":
    main()
