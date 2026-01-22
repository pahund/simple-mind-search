---
name: create-mindmap
description: Create SimpleMind Pro mindmap files for visualising codebases, feature plans, architecture, and discussion summaries. Creates .smmx files in ./mindmaps/ directory.
allowed-tools: Bash(python:*)
---

# Create SimpleMind Mindmap 

Creates SimpleMind mindmap files (.smmx) for visualising:
- Codebase structure and relationships
- Feature planning and implementation steps
- Architecture diagrams showing components
- Discussion summaries and decision trees

## Usage

The skill accepts a JSON structure describing the mindmap:

```bash
python ~/workspace/.claude/skills/create-mindmap/scripts/generate_mindmap.py \
  --title "Feature: User Authentication" \
  --output ./mindmaps/auth-feature.smmx \
  --json '{
    "nodes": [
      {"id": "root", "text": "User Authentication", "parent": null},
      {"id": "backend", "text": "Backend Changes", "parent": "root"},
      {"id": "frontend", "text": "Frontend Changes", "parent": "root"}
    ]
  }'
```

Or pass JSON via stdin:

```bash
echo '{"nodes": [...]}' | python ~/workspace/.claude/skills/create-mindmap/scripts/generate_mindmap.py \
  --title "My Mindmap" \
  --output ./mindmaps/my-map.smmx
```

## When to Use

Invoke this skill when the user:
- Asks to "visualise this in a mindmap"
- Asks to "create a mindmap"
- Wants to see project structure as a mindmap
- Needs a visual representation of a plan or architecture
- Requests a summary of our discussion in mindmap format

## Node Structure

Each node in the JSON can have:
- `id` (required): Unique identifier for the node
- `text` (required): Display text for the topic
- `parent` (required for non-root): ID of parent node (null for root)
- `notes` (optional): Array of note strings to attach to the topic
- `url` (optional): URL link to attach to the topic
- `done` (optional): Boolean indicating if task is complete (shows checkbox)

## Examples

### Codebase Structure
```json
{
  "nodes": [
    {"id": "root", "text": "simple-mind-search", "parent": null},
    {"id": "src", "text": "src/", "parent": "root"},
    {"id": "config", "text": "config/", "parent": "src"},
    {"id": "search", "text": "search/", "parent": "src"}
  ]
}
```

### Feature Planning
```json
{
  "nodes": [
    {"id": "root", "text": "Authentication Feature", "parent": null},
    {"id": "backend", "text": "Backend", "parent": "root", "done": false},
    {"id": "api", "text": "API endpoints", "parent": "backend", "notes": ["POST /auth/login", "POST /auth/logout"]},
    {"id": "frontend", "text": "Frontend", "parent": "root", "done": false},
    {"id": "ui", "text": "Login UI", "parent": "frontend", "url": "https://figma.com/..."}
  ]
}
```
