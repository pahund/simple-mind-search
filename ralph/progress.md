
## Task 1: Implement --done option (Completed 2026-01-22)

Successfully implemented the `--done` CLI option to filter mindmap nodes showing only completed tasks (checked checkboxes).

### Changes made:
1. **src/index.ts**: Added `--done` CLI option to command parser
2. **src/actions/search.ts**: Updated to accept and pass through the `done` parameter; modified validation to allow empty search terms when `--done` is used
3. **src/search/search.ts**: Added `done` parameter to SearchParams interface and search function
4. **src/search/findMatches.ts**: Implemented filtering logic for completed tasks:
   - When `done` flag is true and search string is empty, returns all topics with checked checkboxes
   - When `done` flag is true with search terms, filters to only show matching topics that have checked checkboxes
   - Works correctly with both exact phrase and multi-token searches
5. **src/search/findMatches.test.ts**: Added 4 comprehensive unit tests for `--done` functionality
6. **README.md**: Updated documentation with usage examples and option description

### Test results:
- All 196 unit tests passed (including 4 new tests)
- All 16 integration tests passed
- Code coverage: 96.41% (exceeds 80% requirement)
- Lint and TypeScript checks: passed

### Git commit:
- Commit hash: f344ae7
- Message: "feat: add --done option to filter checked checkbox topics"

## Task 2: Support combined --todo and --done flags (Completed 2026-01-22)

Successfully implemented support for using both `--todo` and `--done` flags together to show all tasks (both checked and unchecked) whilst excluding non-task topics.

### Changes made:
1. **src/search/findMatches.ts**: Updated filtering logic to handle combined flags:
   - When both flags are true and search string is empty, returns all topics with any checkbox (checked or unchecked)
   - When both flags are true with search terms, returns matching topics that have any checkbox status
   - Excludes topics without checkboxes when both flags are used
   - Maintains backward compatibility with individual flag usage
2. **src/search/findMatches.test.ts**: Added 5 comprehensive unit tests for combined flag functionality:
   - Test for combined flags with empty search string
   - Test for combined flags with search terms
   - Test for exclusion of non-checkbox topics
   - Test for exact phrase matching with combined flags
   - Test for multiple token matching with combined flags
3. **README.md**: Updated documentation with usage examples and option description for combined flag usage

### Test results:
- All 201 unit tests passed (including 5 new tests)
- All 16 integration tests passed
- Code coverage: 96.45% (exceeds 80% requirement)
- Lint and TypeScript checks: passed

### Git commit:
- Commit hash: 545ed9f
- Message: "feat: support combined --todo and --done flags"
