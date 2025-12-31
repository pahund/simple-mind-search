# simple-mind-search

[![npm version](https://badge.fury.io/js/simple-mind-search.svg)](https://www.npmjs.com/package/simple-mind-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

`simple-mind-search` is a command line tool that lets you run a text search across all of your [SimpleMind](https://simplemind.eu/) mind maps at once.

## Features

- 🔍 **Fast search** across multiple mind map files
- 📝 **Search in topic text and notes** – finds matches in both
- 🎯 **Smart filtering** – only shows notes that match your search terms
- 📊 **Multiple output formats** – YAML (default) or JSON
- 🔄 **Intelligent sorting** – newest modifications first, with smart lifetime-based tie-breaking
- 🗑️ **Automatic deduplication** – removes duplicate results across mind maps
- 🔤 **Case-insensitive search** – optional case-insensitive matching
- 🌍 **Localised dates** – configurable locale and timezone for date formatting

## Prerequisites

- Node.js 18.0.0 or higher

## Installation

Install globally via npm:

```bash
npm install -g simple-mind-search
```

Or via [Yarn](https://yarnpkg.com/):

```bash
yarn global add simple-mind-search
```

## Configuration

Run the command `simple-mind-search` without any arguments. When you do this for the first time, the programme will create a configuration file _.simple-mind-search.yml_ in your home directory for you.

Adjust according to your requirements:

```yaml
# Path to the directory with your mind maps
mindMapsDir: "~/Documents/Mind Maps"

# Glob pattern for finding files to include in search
filesToSearch: "**/*.smmx"

# Locale for date formatting
locale: en-GB

# Time zone for date formatting
timeZone: CET
```

## Usage

### Basic Search

Run `simple-mind-search` from the command line:

```bash
simple-mind-search <SEARCH_TERM>
```

Replace `<SEARCH_TERM>` with the text you want to search for in your _SimpleMind_ mind maps.

**Examples:**

```bash
# Search for a single term
simple-mind-search project

# Search for multiple terms (all must be present)
simple-mind-search team meeting

# Case-insensitive search
simple-mind-search -i URGENT

# Output as JSON
simple-mind-search -f json deadline

# Verbose output with search statistics
simple-mind-search -v project
```

### Options

- `-i, --ignore-case` – Perform case-insensitive search
- `-v, --verbose` – Show verbose output with search statistics (files searched, matches found, etc.)
- `-f, --format <format>` – Output format: `yaml` (default) or `json`

### Output Formats

#### YAML Output (default)

```yaml
- text: Project planning meeting
  notes:
    - Discuss Q1 goals with team
    - Review project timeline
  file: /path/to/mindmap.smmx
  created: 01/12/2024, 10:30:00
  modified: 15/12/2024, 14:20:00
  url: "https://example.com/meeting"
  done: false
```

#### JSON Output

```json
[
  {
    "text": "Project planning meeting",
    "textWithBreaks": "Project planning%BREAK%meeting",
    "file": "/path/to/mindmap.smmx",
    "created": "2024-12-01T10:30:00.000Z",
    "modified": "2024-12-15T14:20:00.000Z",
    "notes": ["Discuss Q1 goals with team", "Review project timeline"],
    "url": "https://example.com/meeting",
    "done": false
  }
]
```

### How It Works

1. **Search**: The tool searches through all topics and notes in your mind maps
2. **Filter**: Only notes containing search terms are included in results
3. **Deduplicate**: Identical topics found across multiple mind maps are merged
4. **Sort**: Results are sorted by modification date (newest first), with intelligent tie-breaking based on topic lifetime

## Development

### Prerequisites

- Node.js 22.12.0
- Yarn 4.2.2

### Setup

```bash
yarn install
```

### Scripts

```bash
# Run in development mode with ts-node
yarn dev <SEARCH_TERM>

# Build TypeScript to JavaScript
yarn build

# Run built version
yarn start

# Type check without emitting files
yarn ts:check

# Lint code with ESLint
yarn lint

# Format code with Prettier
yarn format

# Run tests once
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with interactive UI
yarn test:ui

# Run tests with coverage report
yarn test:coverage

# Run integration tests (src/__test__)
yarn test:integration
```

### Debugging

The project uses the [debug](https://github.com/debug-js/debug#readme) library to generate some useful console output.

```bash
# View the XML code of the mind map files being searched:
DEBUG=simple-mind-search* yarn dev <SEARCH_TERM>
```

There is a special logger called `xml` to view the XML code of the SimpleMind files being processed. This logger's name is *not* prefixed with `simple-mind-search`, because its output is extremely verbose:

```bash
# View the XML code of the mind map files being searched:
DEBUG=xml yarn dev <SEARCH_TERM>
```

When running tests, console output is suppressed (standard vitest behaviour). To see debug output from tests, pipe the stderr to a log file:

```bash
# run tests with log output
DEBUG=simple-mind-search* yarn test 2>> test.log

# run integration tests with log output
DEBUG=simple-mind-search* yarn test:integration 2>> integration.log
```

If you want to view the log file with [lnav](https://docs.lnav.org/), you can install the [custom format in the resources dir](resources/simple_mind_search.json) like so:


```bash
lnav -i resources/simple_mind_search.json
```

### Project Structure

- `src/` - TypeScript source files
  - `config/` - Configuration loading and validation
  - `deduplication/` - Result deduplication logic
  - `extraction/` - Topic data extraction (dates, URLs, notes, etc.)
  - `files/` - File discovery and unpacking
  - `output/` - Result formatting (YAML/JSON)
  - `search/` - Core search and matching logic
  - `sort/` - Result sorting
  - `utils/` - Utility functions
- `dist/` - Compiled JavaScript output

## Acknowledgements

This tool is built on top of excellent open source libraries:

- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) – Fast and efficient XML parsing for processing SimpleMind mind map files
- [adm-zip](https://github.com/cthackers/adm-zip) – ZIP file handling for extracting .smmx archives
- [commander](https://github.com/tj/commander.js) – Command-line interface framework
- [js-yaml](https://github.com/nodeca/js-yaml) – YAML parser for configuration files
- [fast-glob](https://github.com/mrmlnc/fast-glob) – Fast file system glob matching

## License

MIT © Patrick Hund

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/pahund/simple-mind-search/issues) on GitHub.
