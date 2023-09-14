import * as dotenv from 'dotenv';
import fs from 'fs';

import { Git, StatusResult } from './git.js';
import { CveCore } from './CveCore.js';

import * as _kTestCve0003 from '../../test/pretend_github_repository/1970/0xxx/CVE-1970-0002.json';
import { FsUtils } from './fsUtils.js';

dotenv.config();

describe(`Git`, () => {

    const kTestCve0001 = CveCore.fromCveMetadata(_kTestCve0003.default.cveMetadata);

    const srcDir = `test/fixtures/cve/5`;
    const destDir = `test/pretend_github_repository/1970/0xxx`;
    const destDir9 = `test/pretend_github_repository/1970/9xxx`;

    // Act before assertions
    beforeEach(async () => {
        // const testCves = [
        //     'CVE-1970-0001',
        //     'CVE-1970-0002',
        //     'CVE-1970-0003',
        //     'CVE-1970-0998',
        //     'CVE-1970-0999',
        // ];
        // testCves.forEach((i) =>
        //     fs.copyFileSync(`${srcDir}/${i}.json`, `${destDir}/${i}.json`),
        // );
        fs.copyFileSync(`${srcDir}/CVE-1970-0999.json`, `${destDir}/CVE-1970-0996.json`);
        fs.copyFileSync(`${srcDir}/CVE-1970-0999.json`, `${destDir}/CVE-1970-0997.json`);
        // update existing CVE
        fs.copyFileSync(
            `${srcDir}/CVE-1970-0002u.json`,
            `${destDir}/CVE-1970-0002.json`,
        );
        const prevDelta = {
            published: [],
            updated: [],
        };
    });

    afterEach(async () => {
        // this should not be necessary, but it seems to clean
        //  up the git.lock file so that we don't get errors
        //  about 2 git clients trying to access the same repository
        //  at the same time
        const git = new Git({ localDir });
        await git.status();
    });

    // Teardown (cleanup) after assertions
    afterAll(() => {
        fs.copyFile(`${srcDir}/CVE-1970-0002.json`, `${destDir}/CVE-1970-0002.json`, Git.genericCallback);
        FsUtils.rm(`${destDir}/CVE-1970-0996.json`);
        FsUtils.rm(`${destDir}/CVE-1970-0997.json`);
    });

    const localDir: string = `test/pretend_github_repository`;

    it(`properly builds a Git object with default values`, () => {
        const git = new Git();
        // console.log(`git.localDir=${git.localDir}`);
        // console.log(`process.cwd()=${process.cwd()}`);
        expect(git.localDir).toEqual(`${process.cwd()}/${process.env.CVES_BASE_DIRECTORY}`);
    });


    it(`properly builds a Git object with specified initailizers`, () => {
        const git = new Git({ localDir });
        // console.log(`git.localDir=${git.localDir}`);
        expect(git.localDir).toMatch(localDir);
    });


    it(`properly displays git status`, async () => {
        const git = new Git({ localDir });
        const status = await git.status();
        // console.log(`status=${JSON.stringify(status, null, 2)}`);
        expect(status.not_added).toContain(`${localDir}/1970/0xxx/CVE-1970-0997.json`);
        expect(status.modified).toContain(`${localDir}/1970/0xxx/CVE-1970-0002.json`);
    });

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // all tests above this line do not modify git status
    // all tests below this line MUST undo modifications to git status so each test can assume a common starting point
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


    it(`properly adds and rms a single file`, async () => {
        const git = new Git({ localDir });
        // console.log(`git initialized to ${git.localDir}`);
        const respAdd = await git.add(`1970/0xxx/CVE-1970-0997.json`);
        // console.log(`respAdd=${JSON.stringify(respAdd, null, 2)}`);
        const status = await git.status();
        // console.log(`status=${JSON.stringify(status, null, 2)}`);
        expect(status.staged).toContain(`${localDir}/1970/0xxx/CVE-1970-0997.json`);
        // expect(resp.modified).toContain(`${localDir}/1970/0xxx/CVE-1970-0002.json`);

        // cleanup
        const resp2 = await git.rm(`${process.cwd()}/${destDir}/CVE-1970-0997.json`);
    });


    it(`properly adds and rms multiple files`, async () => {
        const git = new Git({ localDir });
        // console.log(`process.cwd=${process.cwd()}`);
        const respAdd = await git.add([
            `${process.cwd()}/${destDir}/CVE-1970-0996.json`,
            `${process.cwd()}/${destDir}/CVE-1970-0997.json`
        ]);
        // console.log(`respAdd=${JSON.stringify(respAdd, null, 2)}`);
        const status = await git.status();
        // console.log(`status=${JSON.stringify(status, null, 2)}`);
        expect(status.staged).toContain(`${destDir}/CVE-1970-0996.json`);
        expect(status.staged).toContain(`${destDir}/CVE-1970-0997.json`);

        // cleanup
        const resp2 = await git.rm([
            `${process.cwd()}/${destDir}/CVE-1970-0996.json`,
            `${process.cwd()}/${destDir}/CVE-1970-0997.json`
        ]);
    });


    it(`logCommitHashInWindow() properly logs files`, async () => {
        const git = new Git({ localDir });
        const retval = await git.logCommitHashInWindow("2023-02-16T00:00:00.000Z", "2023-08-21T23:59:59.999Z");
        // console.log(`retval=${JSON.stringify(retval, null, 2)}`);
        expect(retval[0]).toEqual(`fa298ddd39500963b357823b802dba6952bc71d0`);
        expect(retval[retval.length - 1]).toEqual(`207b9f2b82908afbd8d9d2270969f6781f9d39e4`);
        expect(retval.length).toBe(26);
    });


    it(`logCommitHashInWindow() properly handles case when there are no commits`, async () => {
        const git = new Git({ localDir });
        const retval = await git.logCommitHashInWindow("1970-02-16T00:00:00.000Z", "1970-03-21T23:59:59.999Z");
        expect(retval.length).toBe(0);
    });


    // @todo this test isn't working because the git history is different than in original development project
    // it(`logChangedFilenamesInTimeWindow() properly logs files`, async () => {
    //     const git = new Git({ localDir });
    //     const retval = await git.logChangedFilenamesInTimeWindow("2023-09-07T21:40:46.000Z", "2023-09-07T21:42:34.000Z");
    //     console.log(`logChangedFilenamesInTimeWindow() returned:  ${JSON.stringify(retval, null, 2)}`);
    //     expect(retval[0]).toContain("example_test.json");
    //     expect(retval.length).toBe(1);
    // });


    it(`logChangedFilenamesInTimeWindow() properly handles case when no files were changed`, async () => {
        const git = new Git({ localDir });
        const retval = await git.logChangedFilenamesInTimeWindow("1970-02-16T00:00:00.000Z", "1970-03-21T23:59:59.999Z");
        // console.log(`logChangedFilenamesInTimeWindow() returned:  ${JSON.stringify(retval, null, 2)}`);
        expect(retval.length).toBe(0);
    });


    it(`logDeltasInTimeWindow() properly logs files`, async () => {
        const git = new Git({ localDir });
        const retval = await git.logDeltasInTimeWindow("2022-02-16T00:00:00.000Z", "2023-08-21T23:59:59.999Z");
        // console.log(`logDeltasInTimeWindow() returned:  ${JSON.stringify(retval, null, 2)}`);
        expect(retval.new[0].cveId.toString()).toContain("CVE-1970-0001");
        expect(retval.new[4].cveId.toString()).toContain("CVE-1999-0001");
        expect(retval.numberOfChanges).toBe(5);
    });

    it(`logDeltasInTimeWindow() properly handles case when no files were changed`, async () => {
        const git = new Git({ localDir });
        const retval = await git.logDeltasInTimeWindow("1970-02-16T00:00:00.000Z", "1970-03-21T23:59:59.999Z");
        // console.log(`logDeltasInTimeWindow() returned:  ${JSON.stringify(retval, null, 2)}`);
        expect(retval.numberOfChanges).toBe(0);
    });
});
