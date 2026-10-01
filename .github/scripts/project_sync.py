#!/usr/bin/env python3
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.github.com"
GRAPHQL = f"{API}/graphql"
TOKEN = os.environ["PROJECT_TOKEN"]
PROJECT_NUMBER = int(os.environ.get("PROJECT_NUMBER", "3"))
REPOSITORY = os.environ["GITHUB_REPOSITORY"]
EVENT_NAME = os.environ.get("GITHUB_EVENT_NAME", "")
EVENT_PATH = os.environ.get("GITHUB_EVENT_PATH", "")
API_VERSION = "2026-03-10"

HEADERS = {
    "Accept": "application/vnd.github+json",
    "Authorization": f"Bearer {TOKEN}",
    "X-GitHub-Api-Version": API_VERSION,
    "User-Agent": "student-perks-hub-project-sync",
}

FIELD_DEFINITIONS = {
    "Priority": [
        ("P0", "RED", "Critical / blocking"),
        ("P1", "ORANGE", "High priority"),
        ("P2", "YELLOW", "Normal priority"),
        ("P3", "GRAY", "Low priority"),
    ],
    "Area": [
        ("Platform", "BLUE", "Infrastructure, CI and developer experience"),
        ("Database", "PURPLE", "Schema, migrations and data"),
        ("Offers", "GREEN", "Offer discovery and content"),
        ("Auth", "YELLOW", "Authentication and user-owned data"),
        ("Admin", "RED", "Administration and authorization"),
        ("UX", "PINK", "User interface and experience"),
        ("SEO", "GRAY", "Search and metadata"),
    ],
    "Target": [
        ("MVP", "GREEN", "Required for initial release"),
        ("Post-MVP", "BLUE", "After initial release"),
    ],
    "Size": [
        ("XS", "GRAY", "Very small"),
        ("S", "GREEN", "Small"),
        ("M", "YELLOW", "Medium"),
        ("L", "ORANGE", "Large"),
    ],
}

BACKLOG = {
    7: ("P0", "Platform", "MVP", "S"),
    8: ("P0", "Platform", "MVP", "XS"),
    9: ("P0", "Database", "MVP", "S"),
    10: ("P0", "Database", "MVP", "XS"),
    11: ("P1", "Offers", "MVP", "S"),
    12: ("P1", "UX", "MVP", "S"),
    13: ("P1", "Database", "MVP", "M"),
    14: ("P1", "Offers", "MVP", "M"),
    15: ("P1", "Offers", "MVP", "L"),
    16: ("P1", "Offers", "MVP", "M"),
    17: ("P1", "Auth", "MVP", "M"),
    18: ("P2", "Auth", "MVP", "M"),
    19: ("P2", "Offers", "MVP", "M"),
    20: ("P1", "Admin", "MVP", "M"),
    21: ("P1", "Platform", "MVP", "L"),
}


def request(method, url, payload=None):
    data = None
    headers = dict(HEADERS)
    if payload is not None:
        data = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            raw = response.read().decode()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        body = exc.read().decode()
        raise RuntimeError(f"{method} {url} failed: {exc.code} {body}") from exc


def rest(method, path, payload=None):
    return request(method, f"{API}/{path.lstrip('/')}", payload)


def graphql(query, variables=None):
    response = request("POST", GRAPHQL, {"query": query, "variables": variables or {}})
    if response.get("errors"):
        raise RuntimeError(json.dumps(response["errors"], indent=2))
    return response["data"]


PROJECT_QUERY = """
query Project($number: Int!) {
  viewer {
    login
    projectV2(number: $number) {
      id
      title
      shortDescription
      readme
      fields(first: 100) {
        nodes {
          ... on ProjectV2FieldCommon {
            id
            name
            dataType
          }
          ... on ProjectV2SingleSelectField {
            id
            name
            dataType
            options { id name color description }
          }
        }
      }
      items(first: 100) {
        nodes {
          id
          content {
            ... on Issue { id number }
            ... on PullRequest { id number }
          }
        }
      }
      views(first: 50) {
        nodes { id name number layout filter }
      }
    }
  }
}
"""


def project_state():
    data = graphql(PROJECT_QUERY, {"number": PROJECT_NUMBER})
    project = data["viewer"]["projectV2"]
    if not project:
        raise RuntimeError(f"PROJECT_TOKEN cannot access personal Project #{PROJECT_NUMBER}.")
    return data["viewer"]["login"], project


def ensure_project_metadata(project):
    desired_short = "Delivery board for Student Perks Hub MVP and post-MVP work."
    desired_readme = (
        "## Student Perks Hub\\n\\n"
        "This project is synchronized from fusumivietnam/student-perks-hub.\\n\\n"
        "- Status: Backlog → Ready → In Progress → Review → Done\\n"
        "- Priority: P0–P3\\n"
        "- Area: Platform, Database, Offers, Auth, Admin, UX, SEO\\n"
        "- Target: MVP or Post-MVP\\n"
        "- Size: XS–L\\n\\n"
        "Issues and pull requests are added by project-sync.yml. "
        "Closing an item moves it to Done; open pull requests are tracked in Review."
    )
    if project.get("shortDescription") == desired_short and project.get("readme") == desired_readme:
        return
    graphql(
        """
        mutation UpdateProject($id: ID!, $short: String!, $readme: String!) {
          updateProjectV2(input: {projectId: $id, shortDescription: $short, readme: $readme}) {
            projectV2 { id }
          }
        }
        """,
        {"id": project["id"], "short": desired_short, "readme": desired_readme},
    )


def field_by_name(project, name):
    return next((f for f in project["fields"]["nodes"] if f and f.get("name") == name), None)


def ensure_status(project):
    status = field_by_name(project, "Status")
    if not status:
        raise RuntimeError("GitHub Project is missing its built-in Status field.")

    existing = {o["name"]: o for o in status.get("options", [])}
    desired = [
        ("Backlog", "GRAY", "Not started"),
        ("Ready", "BLUE", "Ready to implement"),
        ("In Progress", "YELLOW", "Implementation in progress"),
        ("Review", "PURPLE", "Pull request / review"),
        ("Done", "GREEN", "Completed"),
    ]

    inputs = []
    used_ids = set()
    for name, color, description in desired:
        option = existing.get(name)
        if name == "Backlog" and not option:
            option = existing.get("Todo")
        value = {"name": name, "color": color, "description": description}
        if option:
            value["id"] = option["id"]
            used_ids.add(option["id"])
        inputs.append(value)

    for option in status.get("options", []):
        if option["id"] not in used_ids and option["name"] != "Todo":
            inputs.append(
                {
                    "id": option["id"],
                    "name": option["name"],
                    "color": option["color"],
                    "description": option.get("description", ""),
                }
            )

    current_names = [o["name"] for o in status.get("options", [])]
    desired_names = [o["name"] for o in inputs]
    if current_names == desired_names:
        return

    graphql(
        """
        mutation UpdateField($field: ID!, $options: [ProjectV2SingleSelectFieldOptionInput!]) {
          updateProjectV2Field(input: {fieldId: $field, singleSelectOptions: $options}) {
            projectV2Field { ... on ProjectV2SingleSelectField { id } }
          }
        }
        """,
        {"field": status["id"], "options": inputs},
    )


def ensure_custom_fields(project):
    existing = {f["name"] for f in project["fields"]["nodes"] if f}
    for name, options in FIELD_DEFINITIONS.items():
        if name in existing:
            continue
        graphql(
            """
            mutation CreateField(
              $project: ID!,
              $name: String!,
              $options: [ProjectV2SingleSelectFieldOptionInput!]
            ) {
              createProjectV2Field(input: {
                projectId: $project,
                name: $name,
                dataType: SINGLE_SELECT,
                singleSelectOptions: $options
              }) {
                projectV2Field { ... on ProjectV2SingleSelectField { id } }
              }
            }
            """,
            {
                "project": project["id"],
                "name": name,
                "options": [
                    {"name": n, "color": c, "description": d}
                    for n, c, d in options
                ],
            },
        )


def refresh():
    _, project = project_state()
    return project


def item_for_content(project, content_id):
    for item in project["items"]["nodes"]:
        content = item.get("content") if item else None
        if content and content.get("id") == content_id:
            return item["id"]
    return None


def add_item(project_id, content_id):
    data = graphql(
        """
        mutation AddItem($project: ID!, $content: ID!) {
          addProjectV2ItemById(input: {projectId: $project, contentId: $content}) {
            item { id }
          }
        }
        """,
        {"project": project_id, "content": content_id},
    )
    return data["addProjectV2ItemById"]["item"]["id"]


def option_id(project, field_name, option_name):
    field = field_by_name(project, field_name)
    if not field:
        return None, None
    option = next((o for o in field.get("options", []) if o["name"] == option_name), None)
    return field["id"], option["id"] if option else None


def set_select(project, item_id, field_name, option_name):
    field_id, selected = option_id(project, field_name, option_name)
    if not field_id or not selected:
        print(f"warning: missing {field_name}={option_name}", file=sys.stderr)
        return
    graphql(
        """
        mutation SetField($project: ID!, $item: ID!, $field: ID!, $option: String!) {
          updateProjectV2ItemFieldValue(input: {
            projectId: $project,
            itemId: $item,
            fieldId: $field,
            value: {singleSelectOptionId: $option}
          }) {
            projectV2Item { id }
          }
        }
        """,
        {"project": project["id"], "item": item_id, "field": field_id, "option": selected},
    )


def ensure_issue_item(project, issue):
    item_id = item_for_content(project, issue["node_id"])
    if item_id:
        return item_id
    return add_item(project["id"], issue["node_id"])


def bootstrap_issues(project):
    issues = rest("GET", f"repos/{REPOSITORY}/issues?state=open&per_page=100")
    by_number = {i["number"]: i for i in issues if "pull_request" not in i}
    for number, metadata in BACKLOG.items():
        issue = by_number.get(number)
        if not issue:
            continue
        item_id = ensure_issue_item(project, issue)
        priority, area, target, size = metadata
        set_select(project, item_id, "Priority", priority)
        set_select(project, item_id, "Area", area)
        set_select(project, item_id, "Target", target)
        set_select(project, item_id, "Size", size)


def ensure_views(login, project):
    fields = rest("GET", f"users/{urllib.parse.quote(login)}/projectsV2/{PROJECT_NUMBER}/fields?per_page=100")
    field_ids = {f["name"]: f["id"] for f in fields}
    visible_names = ["Title", "Status", "Priority", "Area", "Target", "Size"]
    visible = [field_ids[n] for n in visible_names if n in field_ids]
    status_id = field_ids.get("Status")
    priority_id = field_ids.get("Priority")
    area_id = field_ids.get("Area")
    target_id = field_ids.get("Target")

    existing = {v["name"] for v in project["views"]["nodes"]}

    definitions = [
        ("Current", "board", "-status:Done", [], [status_id] if status_id else []),
        ("Backlog", "table", "is:issue status:Backlog", [[priority_id, "asc"]] if priority_id else [], []),
        ("MVP", "table", "is:issue target:MVP -status:Done", [[priority_id, "asc"]] if priority_id else [], []),
        ("By Area", "table", "is:issue -status:Done", [[priority_id, "asc"]] if priority_id else [], [area_id] if area_id else []),
        ("Review", "board", "is:pr status:Review", [], [status_id] if status_id else []),
        ("Done", "table", "status:Done", [], []),
        ("Roadmap", "table", "is:issue -status:Done", [[priority_id, "asc"]] if priority_id else [], [target_id] if target_id else []),
    ]

    endpoint = f"users/{urllib.parse.quote(login)}/projectsV2/{PROJECT_NUMBER}/views"
    for name, layout, filter_query, sort_by, group_by in definitions:
        if name in existing:
            continue
        payload = {
            "name": name,
            "layout": layout,
            "filter": filter_query,
            "visible_fields": visible,
        }
        if sort_by:
            payload["sort_by"] = sort_by
        if layout == "board" and group_by:
            payload["vertical_group_by"] = group_by
        elif group_by:
            payload["group_by"] = group_by
        rest("POST", endpoint, payload)
        print(f"created view: {name}")


def sync_event(project):
    if not EVENT_PATH or not os.path.exists(EVENT_PATH):
        return
    with open(EVENT_PATH, "r", encoding="utf-8") as fh:
        event = json.load(fh)

    if EVENT_NAME == "issues":
        issue = event["issue"]
        item_id = ensure_issue_item(project, issue)
        action = event.get("action")
        status = "Done" if action == "closed" else "Backlog"
        set_select(project, item_id, "Status", status)
        return

    if EVENT_NAME == "pull_request":
        pr = event["pull_request"]
        item_id = item_for_content(project, pr["node_id"]) or add_item(project["id"], pr["node_id"])
        action = event.get("action")
        if action == "closed":
            status = "Done"
        elif pr.get("draft"):
            status = "In Progress"
        else:
            status = "Review"
        set_select(project, item_id, "Status", status)


def main():
    if not TOKEN:
        raise RuntimeError("PROJECT_TOKEN is missing.")

    login, project = project_state()
    ensure_project_metadata(project)
    ensure_status(project)
    ensure_custom_fields(project)

    project = refresh()

    setup_event = EVENT_NAME in {"push", "workflow_dispatch"}
    if setup_event:
        bootstrap_issues(project)
        project = refresh()
        ensure_views(login, project)

    if EVENT_NAME in {"issues", "pull_request"}:
        sync_event(project)

    print(f"Project #{PROJECT_NUMBER} sync complete.")


if __name__ == "__main__":
    main()
