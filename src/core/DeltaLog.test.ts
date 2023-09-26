import fs from 'fs';

import { CveId, CveCorePlus } from './CveCorePlus.js';
import { Delta, DeltaQueue } from './Delta.js';
import { DeltaLog } from './DeltaLog.js';
// import { activity0, activity1, activity2, activityNone } from './Activity.test.js';
import { FsUtils } from './fsUtils.js';

import * as _kTestCve0001 from '../../test/fixtures/cve/5/CVE-1970-0001.json';
import { IsoDateString } from '../common/IsoDateString.js';
const kCveId0001: string = 'CVE-1970-0001';
const kTestCve0001: CveCorePlus = CveCorePlus.fromCveMetadata(_kTestCve0001.default.cveMetadata);
const kDelta_n_0001: Delta = new Delta({
  numberOfChanges: 1,
  new: [kTestCve0001],
  updated: []
});

describe(`DeltaLog`, () => {

  const kTestPath = `test/temp/deltaLog.json`;
  const kTestPath2 = `test/temp/deltaLog2.json`;
  const kTestLogHistoryDate = new IsoDateString(`2023-07-24T00:00:00.000Z`)

  beforeEach(async () => {
    fs.copyFileSync(`test/fixtures/delta/test_deltaLog.json`, kTestPath);
  });

  afterAll(() => {
    FsUtils.rm(`${kTestPath}`);
  });

  // ----- tests -----

  it(`constructor correctly creates a new deltaLog object`, async () => {
    const log = new DeltaLog();
    expect(log.length).toBe(0);
  });

  it(`fromLogFile() correctly reads in recent deltaLog file`, async () => {
    const log = DeltaLog.fromLogFile(kTestPath, kTestLogHistoryDate);
    expect(log.length).toBe(3);
    expect(log[0].numberOfChanges).toBe(2);
    expect(log[0].fetchTime).toEqual("2023-07-24T17:34:04.394Z");
    expect(log[0].updated.length).toBe(2);
  });

  it(`fromLogFile() correctly deals with non-existing log file`, async () => {
    FsUtils.rm(`${kTestPath}`);
    let log = DeltaLog.fromLogFile(kTestPath);
    // console.log(`log:  ${JSON.stringify(log, null, 2)}`);
    expect(log.length).toBe(0);
    log.writeFile(kTestPath);

    // if I read from this, it should remain empty
    log = DeltaLog.fromLogFile(kTestPath);
    // console.log(`log:  ${JSON.stringify(log, null, 2)}`);
    expect(log.length).toBe(0);
    log.writeFile(kTestPath);
  });

  it(`log file correctly round trips`, async () => {
    const log = DeltaLog.fromLogFile(kTestPath, kTestLogHistoryDate);
    expect(log.length).toBe(3);
    expect(log[0].numberOfChanges).toBe(2);
    log.writeFile(kTestPath2);
    const log2 = DeltaLog.fromLogFile(kTestPath2, kTestLogHistoryDate);
    // console.log(`log=${JSON.stringify(log, null, 2)}`);
    // console.log(`log2=${JSON.stringify(log2, null, 2)}`)
    expect(FsUtils.isSameContent(kTestPath, kTestPath2)).toBeTruthy();
    expect(log2.length).toBe(3)
    FsUtils.rm(kTestPath2);
  });

  it(`prepend() correctly prepends to the log`, async () => {
    const log = DeltaLog.fromLogFile(kTestPath, kTestLogHistoryDate);
    expect(log.length).toBe(3);
    log.prepend(kDelta_n_0001);
    expect(log.length).toBe(4);
    expect(log[0].new[0].cveId.toString()).toBe(kCveId0001);
    log.writeFile(kTestPath2);

    const log2 = DeltaLog.fromLogFile(kTestPath2, kTestLogHistoryDate);
    expect(log2.length).toBe(4);
    expect(log2[0].new[0].cveId.toString()).toBe(kCveId0001);
    FsUtils.rm(kTestPath2);
  });

  it(`sort() correctly sorts the log`, async () => {
    const log = DeltaLog.fromLogFile(kTestPath, kTestLogHistoryDate);
    expect(log.length).toBe(3);
    let sortedLog;
    sortedLog = log.sortByFetchTme("latestLast");
    expect(sortedLog[1].new[0].cveId.toString()).toBe("CVE-2023-3320");
    sortedLog = log.sortByFetchTme("latestFirst");
    expect(sortedLog[0].updated[0].cveId.toString()).toBe("CVE-2023-3319");
    // sortedLog.writeFile(kTestPath2);
  });


  it(`writeFile() does not log if there were no changes`, async () => {
    const log = DeltaLog.fromLogFile(kTestPath);
    log.prepend(
      new Delta()
    );
    expect(log.writeFile(kTestPath)).toBeFalsy();
  });


  it(`writeFile() correctly logs when there are changes`, async () => {
    let delta = new Delta();
    delta.add(kTestCve0001, DeltaQueue.kNew);
    const log = DeltaLog.fromLogFile(kTestPath);
    log.prepend(
      delta
    );
    expect(log.writeFile(kTestPath)).toBeTruthy();
  });

});
