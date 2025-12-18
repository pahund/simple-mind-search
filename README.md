# simple-mind-search

`simple-mind-search` is a command line tool that lets you run a text search in all of your [SimpleMind](https://simplemind.eu/) mind maps at once.

## Prerequisites

- current version of [Node.js](https://nodejs.org/)

## Installation

```bash
npm install -g simple-mind-search
```

## Configuration

Run the command `simple-mind-search` without any arguments. When you do this for the first time, the program will create a configuration file _.simple-mind-search_ in your home directory for you.

Adjust according to your requirements:

```
# Path to the directory with your mind maps
MIND_MAPS_DIR="~/Documents/Mind Maps"

# Glob pattern for finding files to include in search
FILES_TO_SEARCH="**/*.smmx"
```

## Usage

Run the `simple-mind` from the command line:

```bash
simple-mind-search <SEARCH_TERM>
```

Replace `<SEARCH_TERM>` with the text you want to search for in your _SimpleMind_ mind maps.

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
```

### Project Structure

- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript output
