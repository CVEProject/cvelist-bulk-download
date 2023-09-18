import * as dotenv from 'dotenv';
import fs from 'fs';

import { CveCorePlus } from './CveCorePlus.js';
import { Git } from './git.js';
import { Delta, DeltaQueue } from './Delta.js';

// test CVEs
import * as _kTestCve0001 from '../../test/fixtures/cve/5/CVE-1970-0001.json';
import * as _kTestCve0001p from '../../test/fixtures/cve/5/CVE-1970-0001p.json';
import * as _kTestCve0001u from '../../test/fixtures/cve/5/CVE-1970-0001u.json';

import * as _kTestCve0002 from '../../test/fixtures/cve/5/CVE-1970-0002.json';
import * as _kTestCve0002p from '../../test/fixtures/cve/5/CVE-1970-0002p.json';
import * as _kTestCve0002u from '../../test/fixtures/cve/5/CVE-1970-0002u.json';
import * as _kTestCve0002u2 from '../../test/fixtures/cve/5/CVE-1970-0002u2.json';

import * as _kTestCve9999 from '../../test/fixtures/cve/5/CVE-1970-9999.json';
import { FsUtils } from './fsUtils.js';

dotenv.config();

const kFixturesDir = `test/fixtures/cve/5`;
const kTestDir = `test/pretend_github_repository/1970/0xxx`;
const testCves = ["CVE-1970-0001", "CVE-1970-0002", "CVE-1970-0998", "CVE-1970-0999"];
const setup_TestGitRepository = async () => {
  testCves.forEach(async (i) => await fs.copyFile(`${kFixturesDir}/${i}.json`, `${kTestDir}/${i}.json`, Git.genericCallback));
  // update existing CVE
  await fs.copyFile(`${kFixturesDir}/CVE-1970-0002u.json`, `${kTestDir}/CVE-1970-0002.json`, Git.genericCallback);
  await fs.copyFile(`${kFixturesDir}/CVE-1970-0004.json`, `${kTestDir}/CVE-1970-0004.json`, Git.genericCallback);
};

// cleanup pretend_github_repository
const cleanup_TestGitRepository = async () => {
  await fs.copyFile(`${kFixturesDir}/CVE-1970-0002.json`, `${kTestDir}/CVE-1970-0002.json`, Git.genericCallback);
  FsUtils.rm(`${kTestDir}/CVE-1970-0004.json`);
}

describe(`Delta`, () => {

  const kTestDeltaJsonFile = `test/fixtures/delta/test_delta.json`

  const kTestCve0001: CveCorePlus = CveCorePlus.fromCveMetadata(_kTestCve0001.default.cveMetadata);
  const kTestCve0001p: CveCorePlus = CveCorePlus.fromCveMetadata(_kTestCve0001p.default.cveMetadata);
  const kTestCve0001u: CveCorePlus = CveCorePlus.fromCveMetadata(_kTestCve0001u.default.cveMetadata);

  const kTestCve0002: CveCorePlus = CveCorePlus.fromCveMetadata(_kTestCve0002.default.cveMetadata);
  const kTestCve0002p: CveCorePlus = CveCorePlus.fromCveMetadata(_kTestCve0002p.default.cveMetadata);
  const kTestCve0002u: CveCorePlus = CveCorePlus.fromCveMetadata(_kTestCve0002u.default.cveMetadata);
  const kTestCve0002u2: CveCorePlus = CveCorePlus.fromCveMetadata(_kTestCve0002u2.default.cveMetadata);

  const kTestCve9999: CveCorePlus = CveCorePlus.fromCveMetadata(_kTestCve9999.default.cveMetadata);

  // beforeEach(async () => {
  //   fs.copyFileSync(`test/fixtures/delta/test_delta.json`, `test/temp/delta.json`);
  // });

  // afterAll(() => {
  //   // FsUtils.rm(`test/temp/delta.json`);
  // });

  it(`properly builds an empty Delta object`, async () => {
    const delta = new Delta();
    // console.log(`delta = ${JSON.stringify(delta, null, 2)}`);
    expect(delta.numberOfChanges).toBe(0);
    expect(delta.new.length).toBe(0);
    expect(delta.updated.length).toBe(0);
  });


  it(`properly builds a minimum Delta object`, async () => {
    const cveid = "CVE-1970-3320";
    const delta = new Delta();
    delta.add(new CveCorePlus(cveid), DeltaQueue.kNew);
    // console.log(`delta = ${JSON.stringify(delta, null, 2)}`);
    expect(delta.numberOfChanges).toBe(1);
    expect(delta.new.length).toBe(1);
    expect(delta.new[0].cveId.toString()).toBe(cveid);
    expect(delta.updated.length).toBe(0);
  });


  it(`properly build a Delta object from another Delta object`, async () => {
    const prevDelta: Partial<Delta> = {
      numberOfChanges: 2,
      new: [kTestCve9999],
      // published: [kTestCve0001p],
      updated: [kTestCve0002u]
    };
    const delta = new Delta(prevDelta);
    // console.log(`delta = ${JSON.stringify(delta, null, 2)}`);
    expect(delta.fetchTime).toBeUndefined();
    // expect(delta.durationInMsecs).toBeUndefined();
    expect(delta.numberOfChanges).toBe(delta.new.length + delta.updated.length);
    expect(delta.new.length).toBe(1);
    expect(delta.new[0].cveId).toEqual(kTestCve9999.cveId);
    expect(delta.updated.length).toBe(1);
    expect(delta.updated[0].cveId.id).toMatch(kTestCve0002u.cveId.id);
  });


  it(`newDeltaFromGitHistory() properly defaults to now`, async () => {
    await setup_TestGitRepository();
    const startDate = "2023-08-16T00:00:00.000Z";
    const delta = await Delta.newDeltaFromGitHistory(startDate, null, process.env.CVES_TEST_BASE_DIRECTORY);
    const deltaNow = await Delta.newDeltaFromGitHistory(startDate, new Date().toISOString(), process.env.CVES_TEST_BASE_DIRECTORY);
    expect(delta.numberOfChanges).toBe(deltaNow.numberOfChanges);
    expect(delta.unknown).toEqual(deltaNow.unknown);
    await cleanup_TestGitRepository()
  });


  it(`add() properly adds a unique CVE to a Delta object`, async () => {
    const prevDelta = {
      new: [],
      updated: []
    };
    const delta = new Delta(prevDelta);
    // console.log(`(before) delta = ${JSON.stringify(delta, null, 2)}`);

    delta.add(kTestCve9999, DeltaQueue.kNew);
    // console.log(`(after kTestCve9999) delta = ${JSON.stringify(delta, null, 2)}`);
    expect(delta.numberOfChanges).toBe(delta.new.length + delta.updated.length);
    expect(delta.new.length).toBe(1);
    expect(delta.new[0].cveId).toBe(kTestCve9999.cveId);

    delta.add(kTestCve0002u, DeltaQueue.kUpdated);
    // console.log(`(after) delta = ${JSON.stringify(delta, null, 2)}`);
    expect(delta.numberOfChanges).toBe(delta.new.length + delta.updated.length);
    expect(delta.updated.length).toBe(1);
    expect(delta.updated[0].cveId).toBe(kTestCve0002u.cveId);
  });


  it(`add() properly adds a more recently updated CVE to a Delta object already containing that CVE (with an older update)`, async () => {
    const prevDelta = {
      published: [],
      updated: []
    };
    const delta = new Delta(prevDelta);

    delta.add(kTestCve0002u, DeltaQueue.kUpdated);
    // console.log(`(after 2) delta = ${JSON.stringify(delta, null, 2)}`);
    expect(delta.numberOfChanges).toBe(delta.calculateNumDelta());
    expect(delta.updated.length).toBe(1);
    expect(delta.updated[0].dateUpdated).toBe(kTestCve0002u.dateUpdated);

    delta.add(kTestCve0002u2, DeltaQueue.kUpdated);
    // console.log(`(after 2) delta = ${JSON.stringify(delta, null, 2)}`);
    expect(delta.numberOfChanges).toBe(delta.calculateNumDelta());
    expect(delta.updated.length).toBe(1);
    expect(delta.updated[0].dateUpdated).toBe(kTestCve0002u2.dateUpdated);

  });


  it(`add() properly adds a unique CVE first to a Delta object's new, then to updated when it is updated`, async () => {
    const prevDelta = {
      new: [],
      updated: []
    };
    const delta = new Delta(prevDelta);
    delta.add(kTestCve0002p, DeltaQueue.kNew);
    // console.log(`(after) delta = ${JSON.stringify(delta, null, 2)}`);
    expect(delta.numberOfChanges).toBe(1);
    expect(delta.new.length).toBe(1);
    expect(delta.new[0].dateUpdated).toBe(kTestCve0002p.dateUpdated);
    expect(delta.updated.length).toBe(0);

    delta.add(kTestCve0002u, DeltaQueue.kUpdated);
    // console.log(`(after) delta = ${JSON.stringify(delta, null, 2)}`);
    expect(delta.numberOfChanges).toBe(2);
    expect(delta.new.length).toBe(1);
    expect(delta.updated.length).toBe(1);
    expect(delta.updated[0].dateUpdated).toBe(kTestCve0002u.dateUpdated);

    delta.add(kTestCve0002u2, DeltaQueue.kUpdated);
    // console.log(`(after) delta = ${JSON.stringify(delta, null, 2)}`);
    expect(delta.numberOfChanges).toBe(2);
    expect(delta.new.length).toBe(1);
    expect(delta.updated.length).toBe(1);
    expect(delta.updated[0].dateUpdated).toBe(kTestCve0002u2.dateUpdated);
  });





  it(`getCveIdMetaData() properly calculates useful information for a path to a CVE`, async () => {
    expect(Delta.getCveIdMetaData(`preview_cves/2023/1xxx/CVE-2023-1275.json`))
      .toEqual([`CVE-2023-1275`, `2023/1xxx/CVE-2023-1275`]);
  });




  it(`calculateDelta() properly calculates a Delta`, async () => {
    await setup_TestGitRepository();
    const delta = await Delta.calculateDelta({}, `test/pretend_github_repository`);
    console.log(`delta=${JSON.stringify(delta, null, 2)}`);
    console.log(`delta.toText() -> ${delta.toText()}`);

    expect(delta.numberOfChanges).toBe(2);
    expect(delta.new.length).toBe(1);
    expect(delta.updated.length).toBe(1);

    await cleanup_TestGitRepository();
  });


  it(`toText() properly displays human readable text about this Delta`, async () => {
    await setup_TestGitRepository()
    const delta = await Delta.calculateDelta({}, `test/pretend_github_repository`);
    // console.log(`delta=${JSON.stringify(delta, null, 2)}`);
    console.log(`delta.toText() -> ${delta.toText()}`);

    expect(delta.toText()).toContain(`${delta.numberOfChanges} changes`);
    expect(delta.toText()).toContain(`${delta.new.length} new`);
    expect(delta.toText()).toContain(`${delta.updated.length} updated`);

    await cleanup_TestGitRepository();
  });


  it(`writeFile() properl this Delta as a delta.json file`, async () => {
    const destDir = `test/temp/delta.json`;
    const delta = new Delta();
    delta.add(kTestCve0001, DeltaQueue.kNew);
    expect(delta.numberOfChanges).toBe(1);
    expect(delta.new.length).toBe(1);

    delta.add(kTestCve0002u, DeltaQueue.kUpdated);
    // // console.log(`(after 2) delta = ${JSON.stringify(delta, null, 2)}`);
    expect(delta.numberOfChanges).toBe(2);
    expect(delta.new.length).toBe(1);
    expect(delta.updated.length).toBe(1);

    delta.writeFile(destDir);
    expect(FsUtils.isSameContent(destDir, kTestDeltaJsonFile, ["fetchTime"])).toBeTruthy();

    FsUtils.rm(destDir);
  });

});