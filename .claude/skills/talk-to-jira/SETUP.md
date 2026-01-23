# JIRA Skill Setup Guide

Quick setup guide for the JIRA Claude Code skill.

## 1. Install Python Dependencies

```bash
pip3 install -r .claude/skills/jira/requirements.txt
```

Or install globally:

```bash
pip3 install requests python-dotenv pyyaml
```

## 2. Configure Authentication

### Option A: Environment Variables (Recommended)

Add to your `~/.bashrc`, `~/.zshrc`, or equivalent:

```bash
# For Atlassian Cloud
export JIRA_BASE_URL="https://your-company.atlassian.net"
export JIRA_API_TOKEN="your-api-token-here"
export JIRA_EMAIL="your.email@company.com"

# OR for JIRA Server/Data Centre
export JIRA_BASE_URL="https://jira.your-company.com"
export JIRA_PAT="your-personal-access-token-here"
```

Then reload your shell:
```bash
source ~/.bashrc  # or ~/.zshrc
```

### Option B: Using .env File

1. Copy the example file:
   ```bash
   cp .claude/skills/jira/.env.example .claude/skills/jira/.env
   ```

2. Edit `.claude/skills/jira/.env` with your actual credentials

3. The script will automatically load the `.env` file when using `python-dotenv`

## 3. Get Your Credentials

### For Atlassian Cloud (API Token):

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Give it a descriptive name (e.g., "Claude Code JIRA Skill")
4. Copy the token immediately (you won't be able to see it again)
5. Use your Atlassian account email as `JIRA_EMAIL`

### For JIRA Server/Data Centre (Personal Access Token):

1. Log in to your JIRA instance
2. Go to **Profile** → **Personal Access Tokens**
3. Click **Create token**
4. Give it a name and set an expiration (or no expiration)
5. Copy the token value

## 4. Verify Installation

Test the skill with the help command:

```bash
python3 .claude/skills/jira/scripts/jira_client.py --help
```

You should see the usage information without errors.

## 5. Test with a Real Issue

Try fetching an issue (replace with a real issue key from your JIRA):

```bash
python3 .claude/skills/jira/scripts/jira_client.py get PROJ-123
```

If you see the issue details, congratulations! The skill is working correctly.

## 6. Use in Claude Code

You can now use the JIRA skill in Claude Code:

```
/jira get PROJ-123
/jira search "assignee = currentUser() AND status != Done"
/jira comments PROJ-456
/jira related PROJ-789
```

## Troubleshooting

### "Authentication failed" Error

- Verify your `JIRA_BASE_URL` is correct
- For Cloud: Check that both `JIRA_API_TOKEN` and `JIRA_EMAIL` are set correctly
- For Server: Check that `JIRA_PAT` is valid and not expired
- Make sure there are no extra spaces or quotes in your environment variables

### "Resource not found" Error

- Verify the issue key exists and is spelled correctly
- Check that you have permission to view the issue
- Ensure you have access to the project

### "requests library not installed" Error

- Install dependencies: `pip3 install -r .claude/skills/jira/requirements.txt`
- Or install individually: `pip3 install requests`

### Permission Issues

- Verify your JIRA account has the necessary permissions
- Check with your JIRA administrator if you can't access certain issues or projects

## Security Best Practices

1. **Never commit credentials to version control**
   - The `.env` file is already in `.gitignore`
   - Double-check before committing any files

2. **Use least-privilege access**
   - Only grant the permissions you actually need
   - Consider using a dedicated API token for automation

3. **Rotate tokens regularly**
   - Set expiration dates on tokens when possible
   - Regenerate tokens periodically

4. **Store tokens securely**
   - Consider using a password manager for token storage
   - Restrict file permissions on `.env` file: `chmod 600 .env`

## Advanced Configuration

### Custom API Version

The script uses JIRA REST API v3 by default. If you need v2, you can modify the endpoints in the script.

### Proxy Configuration

If you're behind a corporate proxy, set the HTTP proxy environment variables:

```bash
export HTTP_PROXY="http://proxy.company.com:8080"
export HTTPS_PROXY="http://proxy.company.com:8080"
```

### SSL Certificate Verification

If you have SSL certificate issues (not recommended for production):

```python
# Add to session in JiraClient.__init__()
self.session.verify = False
```

## Next Steps

- Read the full documentation in [SKILL.md](SKILL.md)
- Explore JQL queries: https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-with-jira-query-language-jql/
- Customise the output formats to suit your needs
- Create shell aliases for common queries

## Support

If you encounter issues:

1. Check the error message carefully
2. Verify your credentials are correct
3. Test with a simple query first
4. Check JIRA API status: https://status.atlassian.com/
5. Consult the JIRA REST API docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/

For issues specific to this skill, open an issue in the repository.
