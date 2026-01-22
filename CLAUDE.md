# 1. Bash commands

1.1 `yarn dev <SEARCH_TERM>`: Run the script during development for explorative testing, providing a search term

1.1.1 PLEASE NOTE: the search is case sensitive by default; you can make it case-insensitive by using the -i option

1.2 `yarn format`: Format source code files with Prettier

1.3 `yarn lint`: Check source code for errors with ESLint

1.4 `yarn ts:check`: Check source code for TypeScript issues with tsc

1.5 `yarn test`: Run unit tests with Vitest once, i.e. not in watch mode

1.6 `yarn test:coverage`: Measure code coverage

1.7 `yarn test:integration`: Run integration tests with Vitest once, i.e. not in watch mode

# 2. Code style

2.1 Use TypeScript

2.2 Avoid type `any`, implicit or explicit

2.3 Use ES style import/export statements

2.4 Import types with `type` keyword (e.g. `import type {FooType} from "bar"`)

2.5 Avoid `export default`

2.6 Avoid `enum`

2.7 Avoid `for … in`

2.8 Prefer using `for … of` over using `.forEach()`

2.9. Create one TypeScript module per function, using the same name (e.g. _search.ts_ provides function `search()`)

2.10 Destructure imports when possible (e.g. `import { foo } from "bar"`)

2.11 Avoid “magic strings” inside code modules, put them in module _constants.ts_

2.12 If a function has more than two parameters, pass parameters as an object instead which gets destructured; e.g. instead of `function foo(bar, baz, qux)`, write `function foo({ bar, baz, qux })` instead

# 3. Workflow

3.0 Preparation - do this every time you start work on a new task

3.0.1 Run yarn install to make sure npm dependencies are up-to-date

3.0.2 Copy the file .simple-mind-search.default.yml to the home directory, renaming it to .simple-mind-search.yml

3.0.3 Edit the YAML file in the home directory you have copied, change mindMapsDir to /home/dev/workspace/tmp

3.0.4 Run an exploratory test to do a "smoke test", checking if basic functionality of the CLI tool works (cf. section 5)

3.0.5 If the smoke tests fails, stop the workflow, DO NOT try to fix the problem, only report it back to the user

3.1 When you implement a new function, put it in a separate TypeScript module that has the same name and import it where it is needed from there

3.2 When you create a new TypeScript module, and the code is not trivial, create a unit test module with unit tests (cf. section 4)

3.3 Test your code change with exploratory tests (cf. section 5); there should be no uncaught exceptions and the result should be according to the desired result 

3.4 Run the unit tests (cf. section 1.5), make sure no tests fail, fix failing tests, if any

3.5 Run the integration tests (cf. sections 1.7 and 4.6), make sure no tests fail, fix failing tests, if any

3.6 Lint the code (cf. section 1.3)

3.7 Check the code for TS errors (cf. section 1.4)

3.8 Make sure the overall code coverage is over 80% (cf. sections 1.6, 4.5)

3.9 Format the code (cf. section 1.2)

3.10 Make sure any new or changed features or configuration options are documented in the README.md file

# 4. Testing

4.1 Each TypeScript module must have a unit test module to accompany it (e.g. module _search.ts_ has test module _search.test.ts_)

4.2 Exceptions to the previous rule (don't write tests for these):

4.2.1 Modules like `constants.ts` that only expose some variables or types without any functions do not require unit tests

4.2.2 `index.ts` files do not require unit tests

4.2.3 Trivial functions like `printBanner.ts` do not require unit tests (where the code does not have any branching, functions don't have arguments and produce no output)

4.3 Use Vitest for testing

4.4 Avoid snapshot testing

4.5 Code coverage does not have to be 100%, around 90% (for the whole project) is OK

4.6 Do not add or change any integration tests; for now, you have to leave this to the humans, because it involves editing the fixture files in the SimpleMind Pro macOS app, which is something you are not capable of

# 5. Exploratory testing

5.1 Use the skill create-mindmap to create a smmx file in the tmp directory, to be used for testing

5.2 Use the yarn dev command to run a search in the smmx file you have created

5.3 Make sure the command returns the correct output, i.e. the result from the test mindmap that you were searching for

# 6. General rules

6.1 use British English for naming things in the code

6.2 use British English for writing documentation

6.3 use British English in the Claude Code chat

# 7. Version control

7.1 use conventional commits style for commit messages
