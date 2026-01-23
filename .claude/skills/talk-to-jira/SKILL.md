---
name: talk-to-jira
description: Fetch data from Jira using the Jira REST API
allowed-tools: Bash(python:*)
---
# Talk to Jira

A Claude Code skill for fetching and managing JIRA issues via the REST API.

## Usage

```
python ~/workspace/.claude/skills/talk-to-jira/scripts/jira_client.py <command> [options]
```

## Commands

### 1. Fetch Issue Details

Retrieve comprehensive information about a specific JIRA issue:

```
python ~/workspace/.claude/skills/talk-to-jira/scripts/jira_client.py get PROJ-123
```

**Output includes:**
- Issue key and summary
- Description
- Status, priority, and type
- Assignee and reporter
- Created and updated dates
- Components and labels
- Related pull requests (if configured)

### 2. Search Issues (JQL)

Search for multiple issues using JIRA Query Language:

```
python ~/workspace/.claude/skills/talk-to-jira/scripts/jira_client.py search "project = PROJ AND status = 'In Progress'"
```

**Example queries:**
- `"assignee = currentUser() AND status != Done"`
- `"project = PROJ AND created >= -7d"`
- `"labels = bug AND priority = High"`

**Options:**
- `--max-results <n>`: Maximum number of results (default: 50)
- `--fields <list>`: Comma-separated list of fields to include

### 3. Get Comments and Activity

Fetch the discussion thread and activity history:

```
python ~/workspace/.claude/skills/talk-to-jira/scripts/jira_client.py comments PROJ-123
```

**Output includes:**
- All comments with author and timestamp
- Comment body in markdown format
- Activity timeline

**Options:**
- `--limit <n>`: Maximum number of comments to retrieve

### 4. Get Related Issues

Fetch linked issues, blockers, and dependencies:

```
python ~/workspace/.claude/skills/talk-to-jira/scripts/jira_client.py related PROJ-123
```

**Output includes:**
- Parent/sub-task relationships
- Blocked by / blocks relationships
- Related issues
- Duplicates and clones

**Options:**
- `--include-subtasks`: Include all sub-tasks
- `--recursive`: Follow relationship chain recursively

## Configuration

The skill uses environment variables for authentication:

### Required Environment Variables

```bash
# JIRA instance URL
export JIRA_BASE_URL="https://your-company.atlassian.net"

# Authentication (choose one method)
export JIRA_API_TOKEN="your-api-token"  # Recommended for Atlassian Cloud
export JIRA_PAT="your-personal-access-token"  # For Data Centre/Server
```

### Obtaining Credentials

**For Atlassian Cloud (API Token):**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a name and copy the token
4. Use with your email: `email:api_token` for Basic Auth

**For JIRA Data Centre/Server (PAT):**
1. Go to your JIRA instance → Profile → Personal Access Tokens
2. Create a new token
3. Copy the token value

## Output Formats

The skill supports multiple output formats:

- **markdown**: Human-readable markdown (default)
- **json**: Machine-readable JSON
- **yaml**: YAML format

Specify format with `--format` option:

```
python ~/workspace/.claude/skills/talk-to-jira/scripts/jira_client.py get PROJ-123 --format json
```

## Error Handling

The skill handles common errors:

- **Authentication failures**: Checks credentials and provides guidance
- **Issue not found**: Returns helpful message with search suggestions
- **Network errors**: Retries with exponential backoff
- **Rate limiting**: Respects JIRA API rate limits and waits when needed

## Advanced Features

### Custom Fields

Fetch custom fields by specifying field IDs:

```
python ~/workspace/.claude/skills/talk-to-jira/scripts/jira_client.py get PROJ-123 --fields "customfield_10001,customfield_10002"
```

### Pagination

For large result sets, the skill automatically handles pagination:

```
python ~/workspace/.claude/skills/talk-to-jira/scripts/jira_client.py  search "project = PROJ" --max-results 100
```

### Caching

Recent queries are cached for 5 minutes to improve performance:
- Issue details: 5 minutes
- Search results: 2 minutes
- Comments: 10 minutes

## Troubleshooting

### Authentication Issues

If you see "401 Unauthorized":
1. Verify `JIRA_BASE_URL` is correct
2. Check that your API token/PAT is valid
3. For Cloud, ensure you're using email:token format
4. For Server, verify PAT hasn't expired

### Permission Issues

If you see "403 Forbidden":
- Check that you have permission to view the issue
- Verify your account has access to the project

### Connection Issues

If you see connection errors:
- Verify network connectivity
- Check if JIRA is accessible from your environment
- Confirm the base URL includes the correct protocol (https://)

## References

- [JIRA REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v2/)
- [JQL Query Reference](https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-with-jira-query-language-jql/)
- [JIRA API Authentication](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/)

## When to use

Invoke this skill when user:
- Asks what Jira tickets are currently assigned to them 