# CVE Bulk Download Utility

This is a set of utilities for maintaining CVE records on GitHub. It is written in Javascript/Typescript. It is intended to be used as a CLI interface in the following use cases

1. in [CVEProject/cvelistV5](https://github.com/CVEProject/cvelistV5)'s GitHub actions
2. on developer/user environments with access to CVE APIs
   - note some functions or switches may not be available because of a user's CVE API permissions (see [`.env-EXAMPLE`](.env-EXAMPLE) for setting this up)

## Setup for Developing and Running CVE Utils on a Local or VM Development Machine 

You will need to have NodeJS 18.16+ to develop and/or run this project on a local or VM machine. The easiest way to do this is to use [nvm](https://github.com/nvm-sh/nvm).  Then

1. clone this repository
2. set up tokens/secrets/environment variables by making a `.env` file in the root directory.
   - See `.env-EXAMPLE` for an example of what to include
   - You will need to replace the `<var>` variables with your own credentials for this app to work
3. `npm i` to load dependencies.
4. For development, look at `package.json`'s `scripts` for available `npm` scripts
   - of special interest is the `npm run build` command, which builds this project into a single `index.js` file that contains all the necessary code and libraries to run as a Github action.
5. Run `./cves.sh --help`[^1] for help on using the commands.

Some functions (e.g., `update` and `delta` require a `/cves` directory at the same location as `cves.sh`[^1] to work.  To develop/test these functions, you will need to

1. fork [CVEProject/cvelistV5](https://github.com/CVEProject/cvelistV5)
2. clone the fork to your local workstation and `cd` into it
3. `cp <cvelist-bulk-download-root>/.cves.sh .`[^1]
4. `cp <cvelist-bulk-download-root>/.env .`
5. whenever you compile the Bulk Download Utility (e.g., step 4 above) you will need to do:
   - `rm -r ./dist`
   - `cp <cvelist-bulk-download-root>/dist .`
6. Run `./cves.sh`[^1] in the root directory of this project 


## Setup for Running CVE Utils as Github Actions

1. Fork [CVEProject/cvelistV5](https://github.com/CVEProject/cvelistV5).  Everything below assumes you are running on your fork.
2. Set up tokens/secrets/environment variables
   1. In the project's `settings/secrets/actions` page, set up a new environment (e.g., `deployment`) and set up the secret values for `CVE_API_KEY`, `CVE_API_ORG`, and `CVE_API_USER` 
   2. [set up a Classic Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) in your GitHub account setting's [Personal Access Tokens](https://github.com/settings/tokens) page with the following top-level items checked:  `admin:org, admin:org_hook, admin:public_key, admin:repo_hook, audit_log, delete:packages, notifications, repo, user, workflow, write:discussion, write:packages`
   3. Use the repository created in step 1. above. Enable `read and write permissions` for that repository under `Settings > General > Actions> General > Workflow` permissions
3. if you are making changes to CVE Utils for Github actions, copy the `./dist` directory built above into the `.github/workflows/` directory.  This is the single `index.js` file that Github actions will call.
4. Enable and manually run (assuming you have the Github privileges to do so) the following Github actions in your fork **in the following order** (the order matters because there are dependencies in the actions):
   1. CodeQL
   2. CVE Midnight Baseline
   3. CVE Yesterday's Delta Release
   4. CVE Update
   5. CVE Release

The actions are all scheduled, and will start running on the next scheduled run.  You can delete/change the schedules and modify the GitHub action `yml` scripts for your specific needs, and assuming you have the correct credentials, the actions should run exactly as they do in [CVEProject/cvelistV5](https://github.com/CVEProject/cvelistV5).

Note however that because there are dependencies between `CVE Release` and `CVE Midnight Baseline`, there will be errors in `CVE Release` with the message `no matching workflow run found with any artifacts?`.  This is normal since the script is looking for an artifact that has not been build.  Once `CVE Midnight Baseline` has ran, this error should go away.

### Building the Runtime for Github Actions

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

There are 3 CVE-related "secret" environment variables: `CVE_API_KEY`, `CVE_API_ORG`, and `CVE_API_USER`. These need to be defined as specified in the Setup section above.


## Available Scripts

- `clean` - remove coverage data, Jest cache and transpiled files
- `build` - builds and watches for file changes (used during development)
- `build:release` - builds and minizes for runtime
- `lint` - lint source files and tests
- `prettier` - reformat files
- `test` - continuously runs tests whenever source files change
- `test-serial` - runs tests serially for some tests that cannot be run in parallel
- `coverage` - uses Jest for coverage

## Additional Information

This project uses (either verbatim or modified from) the following projects:

1. [jsynowiec/node-typescript-boilerplate](https://github.com/jsynowiec/node-typescript-boilerplate) as a starter (8/26/2022).
   - but not using [Volta][volta]
2. [Quicktype](https://quicktype.io/) to convert CVE schemas to usable Typescript classes. Specifically, all classes in `src/generated/quicktype` are all generated this way:
   - `Cve5`: https://raw.githubusercontent.com/CVEProject/cve-services/dev/schemas/cve/create-full-cve-record-request.json
3. [recommended tsconfig](https://github.com/tsconfig/bases#centralized-recommendations-for-tsconfig-bases)


[^1]: To ensure compatability with DOS/Windows based operating systems, we have provided `./cves.bat` as an alternative for `./cves.sh`.