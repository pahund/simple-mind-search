#!/usr/bin/env python3
"""
JIRA REST API Client for Claude Code Skill

This script provides comprehensive JIRA integration capabilities including:
- Fetching issue details
- Searching issues with JQL
- Retrieving comments and activity
- Getting related issues and dependencies
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

try:
    import requests
    from requests.auth import HTTPBasicAuth
except ImportError:
    print("ERROR: requests library not installed", file=sys.stderr)
    print("Install with: pip3 install requests", file=sys.stderr)
    sys.exit(1)

# Load .env file if it exists
try:
    from dotenv import load_dotenv
    # Look for .env file in the same directory as this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(os.path.dirname(script_dir), ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)
except ImportError:
    # python-dotenv not installed, will use environment variables only
    pass


class JiraClient:
    """Client for interacting with JIRA REST API"""

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_token: Optional[str] = None,
        pat: Optional[str] = None,
        email: Optional[str] = None,
    ):
        """
        Initialise JIRA client

        Args:
            base_url: JIRA instance URL (e.g., https://company.atlassian.net)
            api_token: API token for Atlassian Cloud
            pat: Personal Access Token for Server/Data Centre
            email: Email address for Cloud authentication
        """
        self.base_url = base_url or os.environ.get("JIRA_BASE_URL")
        if not self.base_url:
            raise ValueError(
                "JIRA_BASE_URL environment variable or base_url parameter required")

        # Ensure base_url ends with /
        if not self.base_url.endswith("/"):
            self.base_url += "/"

        # Set up authentication
        self.session = requests.Session()

        # Try PAT first (Server/DC), then API token (Cloud)
        pat = pat or os.environ.get("JIRA_PAT")
        api_token = api_token or os.environ.get("JIRA_API_TOKEN")
        email = email or os.environ.get("JIRA_EMAIL")

        if pat:
            # Personal Access Token for Server/DC
            self.session.headers.update({"Authorization": f"Bearer {pat}"})
            self.auth_type = "PAT"
        elif api_token:
            # API Token for Cloud (requires email)
            if not email:
                raise ValueError(
                    "JIRA_EMAIL required when using JIRA_API_TOKEN")
            self.session.auth = HTTPBasicAuth(email, api_token)
            self.auth_type = "API_TOKEN"
        else:
            raise ValueError(
                "Authentication required: set JIRA_PAT or (JIRA_API_TOKEN + JIRA_EMAIL)"
            )

        self.session.headers.update(
            {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        )

        # Cache for API responses (simple in-memory cache)
        self._cache: Dict[str, tuple[Any, datetime]] = {}
        self._cache_ttl = {
            "issue": timedelta(minutes=5),
            "search": timedelta(minutes=2),
            "comments": timedelta(minutes=10),
        }

    def _get_cache_key(self, cache_type: str, key: str) -> str:
        """Generate cache key"""
        return f"{cache_type}:{key}"

    def _get_cached(self, cache_type: str, key: str) -> Optional[Any]:
        """Get cached value if not expired"""
        cache_key = self._get_cache_key(cache_type, key)
        if cache_key in self._cache:
            value, timestamp = self._cache[cache_key]
            ttl = self._cache_ttl.get(cache_type, timedelta(minutes=5))
            if datetime.now() - timestamp < ttl:
                return value
            # Expired, remove from cache
            del self._cache[cache_key]
        return None

    def _set_cache(self, cache_type: str, key: str, value: Any) -> None:
        """Set cached value"""
        cache_key = self._get_cache_key(cache_type, key)
        self._cache[cache_key] = (value, datetime.now())

    def _make_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict] = None,
        json_data: Optional[Dict] = None,
        retry_count: int = 3,
    ) -> Dict[str, Any]:
        """
        Make API request with error handling and retries

        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            params: Query parameters
            json_data: JSON body data
            retry_count: Number of retries on failure

        Returns:
            API response as dictionary

        Raises:
            requests.HTTPError: On API errors
        """
        url = urljoin(self.base_url, endpoint)

        for attempt in range(retry_count):
            try:
                response = self.session.request(
                    method=method,
                    url=url,
                    params=params,
                    json=json_data,
                    timeout=30,
                )
                response.raise_for_status()

                # Parse JSON response
                if response.text:
                    try:
                        return response.json()
                    except ValueError as json_err:
                        # JSON parsing failed - show what we actually received
                        print(
                            f"ERROR: Failed to parse JSON response from {url}", file=sys.stderr)
                        print(
                            f"Status code: {response.status_code}", file=sys.stderr)
                        print(
                            f"Content-Type: {response.headers.get('Content-Type', 'unknown')}", file=sys.stderr)
                        print(f"Response preview (first 500 chars):",
                              file=sys.stderr)
                        print(response.text[:500], file=sys.stderr)
                        raise ValueError(
                            f"Invalid JSON response from JIRA API. "
                            f"Check the error details above."
                        ) from json_err
                else:
                    return {}

            except requests.exceptions.HTTPError as e:
                if response.status_code == 401:
                    raise ValueError(
                        f"Authentication failed ({self.auth_type}). "
                        "Check credentials and permissions."
                    ) from e
                elif response.status_code == 403:
                    raise ValueError(
                        f"Permission denied for {endpoint}. "
                        "Check that you have access to this resource."
                    ) from e
                elif response.status_code == 404:
                    raise ValueError(
                        f"Resource not found: {endpoint}. "
                        "Check that the issue key or project exists."
                    ) from e
                elif response.status_code == 429:
                    # Rate limited, wait and retry
                    if attempt < retry_count - 1:
                        wait_time = (attempt + 1) * 2
                        print(
                            f"Rate limited. Waiting {wait_time}s...",
                            file=sys.stderr,
                        )
                        import time
                        time.sleep(wait_time)
                        continue
                    raise ValueError(
                        "Rate limit exceeded. Try again later.") from e
                else:
                    raise

            except requests.exceptions.ConnectionError as e:
                if attempt < retry_count - 1:
                    continue
                raise ValueError(
                    f"Connection error to {self.base_url}. "
                    "Check network connectivity and base URL."
                ) from e

            except requests.exceptions.Timeout as e:
                if attempt < retry_count - 1:
                    continue
                raise ValueError("Request timeout. Try again later.") from e

        raise ValueError("Max retries exceeded")

    def get_issue(
        self, issue_key: str, fields: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Get issue details

        Args:
            issue_key: Issue key (e.g., PROJ-123)
            fields: List of fields to retrieve (None = all fields)

        Returns:
            Issue data dictionary
        """
        # Check cache
        cache_key = f"{issue_key}:{','.join(fields or [])}"
        cached = self._get_cached("issue", cache_key)
        if cached:
            return cached

        params = {}
        if fields:
            params["fields"] = ",".join(fields)

        endpoint = f"rest/api/2/issue/{issue_key}"
        result = self._make_request("GET", endpoint, params=params)

        # Cache result
        self._set_cache("issue", cache_key, result)

        return result

    def search_issues(
        self,
        jql: str,
        max_results: int = 50,
        fields: Optional[List[str]] = None,
        start_at: int = 0,
    ) -> Dict[str, Any]:
        """
        Search issues using JQL

        Args:
            jql: JQL query string
            max_results: Maximum number of results (max 1000)
            fields: List of fields to retrieve
            start_at: Pagination offset

        Returns:
            Search results dictionary with 'issues' list
        """
        # Check cache
        cache_key = f"{jql}:{max_results}:{start_at}:{','.join(fields or [])}"
        cached = self._get_cached("search", cache_key)
        if cached:
            return cached

        data = {
            "jql": jql,
            "maxResults": min(max_results, 1000),
            "startAt": start_at,
        }

        if fields:
            data["fields"] = fields

        endpoint = "rest/api/2/search"
        result = self._make_request("POST", endpoint, json_data=data)

        # Cache result
        self._set_cache("search", cache_key, result)

        return result

    def get_comments(
        self, issue_key: str, max_results: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get comments for an issue

        Args:
            issue_key: Issue key (e.g., PROJ-123)
            max_results: Maximum number of comments to retrieve

        Returns:
            List of comment dictionaries
        """
        # Check cache
        cache_key = f"{issue_key}:{max_results}"
        cached = self._get_cached("comments", cache_key)
        if cached:
            return cached

        params = {}
        if max_results:
            params["maxResults"] = max_results

        endpoint = f"rest/api/2/issue/{issue_key}/comment"
        result = self._make_request("GET", endpoint, params=params)

        comments = result.get("comments", [])

        # Cache result
        self._set_cache("comments", cache_key, comments)

        return comments

    def get_related_issues(
        self, issue_key: str, include_subtasks: bool = False
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get related issues (links, subtasks, parent)

        Args:
            issue_key: Issue key (e.g., PROJ-123)
            include_subtasks: Include all subtask details

        Returns:
            Dictionary with categorised related issues
        """
        issue = self.get_issue(
            issue_key,
            fields=["issuelinks", "subtasks", "parent"],
        )

        related = {
            "blocks": [],
            "is_blocked_by": [],
            "relates_to": [],
            "duplicates": [],
            "is_duplicated_by": [],
            "clones": [],
            "is_cloned_by": [],
            "parent": None,
            "subtasks": [],
        }

        fields = issue.get("fields", {})

        # Parse issue links
        for link in fields.get("issuelinks", []):
            link_type = link.get("type", {}).get("name", "").lower()

            if "outwardIssue" in link:
                linked_issue = link["outwardIssue"]
                if "blocks" in link_type:
                    related["blocks"].append(linked_issue)
                elif "duplicate" in link_type:
                    related["duplicates"].append(linked_issue)
                elif "clone" in link_type:
                    related["clones"].append(linked_issue)
                else:
                    related["relates_to"].append(linked_issue)

            if "inwardIssue" in link:
                linked_issue = link["inwardIssue"]
                if "blocks" in link_type:
                    related["is_blocked_by"].append(linked_issue)
                elif "duplicate" in link_type:
                    related["is_duplicated_by"].append(linked_issue)
                elif "clone" in link_type:
                    related["is_cloned_by"].append(linked_issue)
                else:
                    related["relates_to"].append(linked_issue)

        # Parent issue
        if "parent" in fields and fields["parent"]:
            related["parent"] = fields["parent"]

        # Subtasks
        if "subtasks" in fields:
            if include_subtasks:
                # Fetch full details for each subtask
                for subtask in fields["subtasks"]:
                    subtask_key = subtask.get("key")
                    if subtask_key:
                        subtask_details = self.get_issue(subtask_key)
                        related["subtasks"].append(subtask_details)
            else:
                related["subtasks"] = fields["subtasks"]

        return related


def format_issue_markdown(issue: Dict[str, Any]) -> str:
    """Format issue as markdown"""
    fields = issue.get("fields", {})

    output = [
        f"# {issue.get('key')}: {fields.get('summary', 'N/A')}",
        "",
        f"**Status:** {fields.get('status', {}).get('name', 'N/A')}",
        f"**Priority:** {fields.get('priority', {}).get('name', 'N/A')}",
        f"**Type:** {fields.get('issuetype', {}).get('name', 'N/A')}",
    ]

    assignee = fields.get("assignee")
    if assignee:
        output.append(f"**Assignee:** {assignee.get('displayName', 'N/A')}")

    reporter = fields.get("reporter")
    if reporter:
        output.append(f"**Reporter:** {reporter.get('displayName', 'N/A')}")

    created = fields.get("created", "")
    if created:
        output.append(f"**Created:** {created[:10]}")

    updated = fields.get("updated", "")
    if updated:
        output.append(f"**Updated:** {updated[:10]}")

    output.append("")
    output.append("## Description")
    output.append("")

    description = fields.get("description")
    if description:
        # Handle Atlassian Document Format (ADF)
        if isinstance(description, dict):
            output.append(_convert_adf_to_markdown(description))
        else:
            output.append(str(description))
    else:
        output.append("_No description provided_")

    # Labels
    labels = fields.get("labels", [])
    if labels:
        output.append("")
        output.append(f"**Labels:** {', '.join(labels)}")

    # Components
    components = fields.get("components", [])
    if components:
        comp_names = [c.get("name", "") for c in components]
        output.append(f"**Components:** {', '.join(comp_names)}")

    return "\n".join(output)


def format_search_results_markdown(results: Dict[str, Any]) -> str:
    """Format search results as markdown"""
    issues = results.get("issues", [])
    total = results.get("total", 0)

    output = [
        f"# Search Results: {total} issue(s) found",
        "",
    ]

    for issue in issues:
        fields = issue.get("fields", {})
        key = issue.get("key", "N/A")
        summary = fields.get("summary", "N/A")
        status = fields.get("status", {}).get("name", "N/A")

        output.append(f"## {key}: {summary}")
        output.append(f"**Status:** {status}")
        output.append("")

    return "\n".join(output)


def format_comments_markdown(issue_key: str, comments: List[Dict[str, Any]]) -> str:
    """Format comments as markdown"""
    output = [
        f"# Comments for {issue_key}",
        "",
        f"**Total comments:** {len(comments)}",
        "",
    ]

    for i, comment in enumerate(comments, 1):
        author = comment.get("author", {}).get("displayName", "Unknown")
        created = comment.get("created", "")[:16].replace("T", " ")

        output.append(f"## Comment {i} by {author} at {created}")
        output.append("")

        body = comment.get("body")
        if body:
            if isinstance(body, dict):
                output.append(_convert_adf_to_markdown(body))
            else:
                output.append(str(body))
        else:
            output.append("_No content_")

        output.append("")

    return "\n".join(output)


def format_related_issues_markdown(issue_key: str, related: Dict[str, Any]) -> str:
    """Format related issues as markdown"""
    output = [
        f"# Related Issues for {issue_key}",
        "",
    ]

    if related.get("parent"):
        parent = related["parent"]
        output.append(
            f"**Parent:** {parent.get('key')} - {parent.get('fields', {}).get('summary', 'N/A')}")
        output.append("")

    for category, issues in related.items():
        if category == "parent" or not issues:
            continue

        title = category.replace("_", " ").title()
        output.append(f"## {title} ({len(issues)})")
        output.append("")

        for issue in issues:
            if isinstance(issue, dict):
                key = issue.get("key", "N/A")
                summary = issue.get("fields", {}).get("summary", "N/A")
                output.append(f"- **{key}:** {summary}")

        output.append("")

    return "\n".join(output)


def _convert_adf_to_markdown(adf: Dict[str, Any]) -> str:
    """Convert Atlassian Document Format to markdown (simplified)"""
    lines = []

    def process_content(content: List[Dict[str, Any]], depth: int = 0) -> None:
        for node in content:
            node_type = node.get("type", "")

            if node_type == "paragraph":
                line_parts = []
                for item in node.get("content", []):
                    if item.get("type") == "text":
                        text = item.get("text", "")
                        marks = item.get("marks", [])

                        for mark in marks:
                            mark_type = mark.get("type")
                            if mark_type == "strong":
                                text = f"**{text}**"
                            elif mark_type == "em":
                                text = f"*{text}*"
                            elif mark_type == "code":
                                text = f"`{text}`"

                        line_parts.append(text)

                lines.append("".join(line_parts))

            elif node_type == "heading":
                level = node.get("attrs", {}).get("level", 1)
                text = "".join(
                    item.get("text", "")
                    for item in node.get("content", [])
                    if item.get("type") == "text"
                )
                lines.append(f"{'#' * level} {text}")

            elif node_type == "bulletList" or node_type == "orderedList":
                for item in node.get("content", []):
                    if item.get("type") == "listItem":
                        text = "".join(
                            child.get("text", "")
                            for para in item.get("content", [])
                            for child in para.get("content", [])
                            if child.get("type") == "text"
                        )
                        prefix = "-" if node_type == "bulletList" else f"{depth + 1}."
                        lines.append(f"{prefix} {text}")

            elif node_type == "codeBlock":
                code = "".join(
                    item.get("text", "")
                    for item in node.get("content", [])
                    if item.get("type") == "text"
                )
                lang = node.get("attrs", {}).get("language", "")
                lines.append(f"```{lang}")
                lines.append(code)
                lines.append("```")

    process_content(adf.get("content", []))
    return "\n".join(lines)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="JIRA REST API Client for Claude Code",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    subparsers = parser.add_subparsers(
        dest="command", help="Command to execute")

    # Get issue command
    get_parser = subparsers.add_parser("get", help="Get issue details")
    get_parser.add_argument("issue_key", help="Issue key (e.g., PROJ-123)")
    get_parser.add_argument(
        "--fields",
        help="Comma-separated list of fields to retrieve",
    )
    get_parser.add_argument(
        "--format",
        choices=["markdown", "json", "yaml"],
        default="markdown",
        help="Output format",
    )

    # Search issues command
    search_parser = subparsers.add_parser(
        "search", help="Search issues with JQL")
    search_parser.add_argument("jql", help="JQL query string")
    search_parser.add_argument(
        "--max-results",
        type=int,
        default=50,
        help="Maximum number of results",
    )
    search_parser.add_argument(
        "--fields",
        help="Comma-separated list of fields to retrieve",
    )
    search_parser.add_argument(
        "--format",
        choices=["markdown", "json", "yaml"],
        default="markdown",
        help="Output format",
    )

    # Get comments command
    comments_parser = subparsers.add_parser(
        "comments", help="Get issue comments")
    comments_parser.add_argument(
        "issue_key", help="Issue key (e.g., PROJ-123)")
    comments_parser.add_argument(
        "--limit",
        type=int,
        help="Maximum number of comments",
    )
    comments_parser.add_argument(
        "--format",
        choices=["markdown", "json", "yaml"],
        default="markdown",
        help="Output format",
    )

    # Get related issues command
    related_parser = subparsers.add_parser(
        "related", help="Get related issues")
    related_parser.add_argument("issue_key", help="Issue key (e.g., PROJ-123)")
    related_parser.add_argument(
        "--include-subtasks",
        action="store_true",
        help="Include full subtask details",
    )
    related_parser.add_argument(
        "--format",
        choices=["markdown", "json", "yaml"],
        default="markdown",
        help="Output format",
    )

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    try:
        # Initialise JIRA client
        client = JiraClient()

        # Execute command
        if args.command == "get":
            fields = args.fields.split(",") if args.fields else None
            result = client.get_issue(args.issue_key, fields=fields)

            if args.format == "json":
                print(json.dumps(result, indent=2))
            elif args.format == "yaml":
                try:
                    import yaml
                    print(yaml.dump(result, default_flow_style=False))
                except ImportError:
                    print("ERROR: pyyaml not installed", file=sys.stderr)
                    sys.exit(1)
            else:
                print(format_issue_markdown(result))

        elif args.command == "search":
            fields = args.fields.split(",") if args.fields else None
            result = client.search_issues(
                args.jql,
                max_results=args.max_results,
                fields=fields,
            )

            if args.format == "json":
                print(json.dumps(result, indent=2))
            elif args.format == "yaml":
                try:
                    import yaml
                    print(yaml.dump(result, default_flow_style=False))
                except ImportError:
                    print("ERROR: pyyaml not installed", file=sys.stderr)
                    sys.exit(1)
            else:
                print(format_search_results_markdown(result))

        elif args.command == "comments":
            result = client.get_comments(
                args.issue_key, max_results=args.limit)

            if args.format == "json":
                print(json.dumps(result, indent=2))
            elif args.format == "yaml":
                try:
                    import yaml
                    print(yaml.dump(result, default_flow_style=False))
                except ImportError:
                    print("ERROR: pyyaml not installed", file=sys.stderr)
                    sys.exit(1)
            else:
                print(format_comments_markdown(args.issue_key, result))

        elif args.command == "related":
            result = client.get_related_issues(
                args.issue_key,
                include_subtasks=args.include_subtasks,
            )

            if args.format == "json":
                print(json.dumps(result, indent=2))
            elif args.format == "yaml":
                try:
                    import yaml
                    print(yaml.dump(result, default_flow_style=False))
                except ImportError:
                    print("ERROR: pyyaml not installed", file=sys.stderr)
                    sys.exit(1)
            else:
                print(format_related_issues_markdown(args.issue_key, result))

    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nInterrupted by user", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
