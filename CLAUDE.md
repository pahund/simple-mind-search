# 1. Bash commands

1.1 `yarn dev <SEARCH_TERM>`: Run the script during development for explorative testing, providing a search term

1.2 `yarn format`: Format source code files with Prettier

1.3 `yarn lint`: Check source code for errors with ESLint

1.4 `yarn ts:check`: Check source code for TypeScript issues with tsc

1.5 `yarn test`: Run unit tests with Vitest once, i.e. not in watch mode

1.6 `yarn test:coverage`: Measure code coverage

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

3.1 When you implement a new function, put it in a separate TypeScript module that has the same name and import it where it is needed from there

3.2 When you create a new TypeScript module, and the code is not trivial, create a unit test module with unit tests (cf. section 4)

3.3 Test your code change exploratively by running the script (cf. section 1.1); there should be no uncaught exceptions and the result should be according to the desired result specified in the prompt

3.4 Run the unit tests (cf. section 1.5), make sure no tests fail, fix failing tests, if any

3.6 Lint the code (cf. section 1.3)

3.7 Check the code for TS errors (cf. section 1.4)

3.8 Make sure the overall code coverage is over 80% (cf. sections 1.6, 4.8)

3.9 Format the code (cf. section 1.2)

# 4. Testing

4.1 Each TypeScript module must have a unit test module to accompany it (e.g. module _search.ts_ has test module _search.test.ts_)

4.2 Exceptions to the previous rule (don't write tests for these):

4.2.1 Modules like `constants.ts` that only expose some variables or types without any functions do not require unit tests

4.2.2 `index.ts` files do not require unit tests

4.2.3 Trivial functions like `printBanner.ts` do not require unit tests (where the code does not have any branching, functions don't have arguments and produce no output)

4.3 Use Vitest for testing

4.4 Avoid snapshot testing

4.5 Code coverage does not have to be 100%, around 80% (for the whole project) is OK

5. General rules

5.1 use British English for naming things in the code

5.2 use British English for writing documentation
