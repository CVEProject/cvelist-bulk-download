# CVE Bulk Download Utility

This is a set of utilities for maintaining CVE records on GitHub. It is written in Javascript/Typescript. It is intended to be used as a CLI interface in the following use cases

1. in [CVEProject/cvelistV5](https://github.com/CVEProject/cvelistV5)'s GitHub actions
2. on developer/user environments with access to CVE APIs
   - note some functions or switches may not be available because of a user's CVE API permissions (see [`.env-EXAMPLE`](.env-EXAMPLE) for setting this up)

## Setup

You will need to have NodeJS 16.x to develop and/or run this project. Then

1. Be sure to create/update a `.env` file in the directory you want to run in. 
   - See `.env-EXAMPLE` for an example of what to include
   - You will need to replace the `<var>` variables with your own credentials for this app to work
2. `npm i` to load dependencies.
3. `npm run build` to build the `dist` directory

## Running CVE Utils

1. Follow the steps in the Setup section above.
2. Run `./cves.sh --help` for help on using the commands.

## Developing CVE Utils

Follow the steps in the Setup section above.

### Building the Runtime for CVEProject/cvelistV5

1. Make sure the code has been reviewed.
2. Modify the version in `src/main.ts` line 17. It should follow semver conventions.
3. Use `npm run build` or `npm run build:release` to build the `dist`/`release` directories respectively

### Fixtures

For `src/core/Delta.test.ts` to work properly, do not commit `pretend_github_repository/1970/0xxx/CVE-1970-0999.json`. It is intended to be copied from `fixtures` during testing to test that a new file shows up in the `new` list of an activity's delta.

### Testing

There are 2 `npm` scripts for running tests. Most of the time, just running

```bash
npm run test
```

should do it. However, there are times, when tests in `git.serial-test.ts` fail due to the way Jest runs everything in parallel, and some tests in `git.serial-test.ts` will report errors because of race conditions. To mitigate this, run `npm run test` first, and if you get errors in `git.serial-test.ts`, re-run the test using `npm run test-serial` to run tests in "`runInBand`" (that is, one at a time in serial) mode. This approach is much slower, but should solve any race conditions that may occur during testing.

## Environment Variables and Secrets

There are 3 CVE-related "secret" environment variables: `CVE_API_KEY`, `CVE_API_ORG`, and `CVE_API_USER`. These are defined at [CveProject/cvelistV5/Settings](https://github.com/CVEProject/cvelistV5/settings/environments/892781747/edit) when deployed to CVEProject/cvelistV5, and in `.env` for local development. Note that some CLI functions may not work if your account does not have the right permissions.

Other useful environment variables are for Github interactions:

- `GH_ACCESS_TOKEN` - generate one at https://github.com/settings/keys (your account settings)
- `GH_OWNER` - this should be `CVEProject` for the project (unless you are using a fork for testing)
- `GH_REPO` - this should be `cvelistV5`

## Available Scripts

- `clean` - remove coverage data, Jest cache and transpiled files,
- `build` - builds and watches for file changes (used during development)
- `build:release` - builds and minizes for runtime
- `lint` - lint source files and tests,
- `prettier` - reformat files,
- `test` - run tests and watches for changes,
- `coverage` - uses Jest for coverage

## Additional Information

This project is built using

1. [jsynowiec/node-typescript-boilerplate](https://github.com/jsynowiec/node-typescript-boilerplate) as a starter (8/26/2022).
   - but not using [Volta][volta]
2. [Quicktype](https://quicktype.io/) to convert CVE schemas to usable Typescript classes. Specifically, all classes in `src/generated/quicktype` are all generated this way:
   - `Cve5`: https://raw.githubusercontent.com/CVEProject/cve-services/dev/schemas/cve/create-full-cve-record-request.json

### ES Modules

This template uses native [ESM][esm]. Make sure to read [this][nodejs-esm], and [this][ts47-esm] first.

[ts-badge]: https://img.shields.io/badge/TypeScript-4.7-blue.svg
[nodejs-badge]: https://img.shields.io/badge/Node.js->=%2016.13-blue.svg
[nodejs]: https://nodejs.org/dist/latest-v14.x/docs/api/
[gha-badge]: https://github.com/jsynowiec/node-typescript-boilerplate/actions/workflows/nodejs.yml/badge.svg
[gha-ci]: https://github.com/jsynowiec/node-typescript-boilerplate/actions/workflows/nodejs.yml
[typescript]: https://www.typescriptlang.org/
[typescript-4-7]: https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/
[license-badge]: https://img.shields.io/badge/license-APLv2-blue.svg
[license]: https://github.com/jsynowiec/node-typescript-boilerplate/blob/main/LICENSE
[sponsor-badge]: https://img.shields.io/badge/♥-Sponsor-fc0fb5.svg
[sponsor]: https://github.com/sponsors/jsynowiec
[jest]: https://facebook.github.io/jest/
[eslint]: https://github.com/eslint/eslint
[wiki-js-tests]: https://github.com/jsynowiec/node-typescript-boilerplate/wiki/Unit-tests-in-plain-JavaScript
[prettier]: https://prettier.io
[volta]: https://volta.sh
[volta-getting-started]: https://docs.volta.sh/guide/getting-started
[volta-tomdale]: https://twitter.com/tomdale/status/1162017336699838467?s=20
[gh-actions]: https://github.com/features/actions
[repo-template-action]: https://github.com/jsynowiec/node-typescript-boilerplate/generate
[esm]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[sindresorhus-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
[nodejs-esm]: https://nodejs.org/docs/latest-v16.x/api/esm.html
[ts47-esm]: https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#esm-nodejs
[editorconfig]: https://editorconfig.org
