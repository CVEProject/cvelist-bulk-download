import * as dotenv from 'dotenv';

import { CveRecord } from './CveRecord.js';
import { CveService } from '../net/CveService.js';
import { FsUtils } from './fsUtils.js';

dotenv.config();

describe(`CveRecord object`, () => {

  // constants that may change as database changes
  const kCveId = `CVE-1999-0001`;
  const kFixtureFilepath = `./test/fixtures/cve/5`;
  const kFixtureCve_1999_0001 = `${kFixtureFilepath}/CVE-1999-0001.json`;
  const kCveRecord = `CVE_RECORD`;
  const kCveDataVersion = "5.0";


  it(`correctly represents a simple CVE in JSON 5 format`, async () => {
    const cveService = new CveService();
    const cve = await cveService.getCveUsingId(kCveId);
    expect(cve?.cveId).toEqual(kCveId);
    expect(cve?.cveMetadata?.cveId).toEqual(kCveId);
    expect(cve?.dataType).toEqual(kCveRecord);
    expect(cve?.dataVersion).toEqual(kCveDataVersion);
  });



  it(`correctly builds a CVE Record from a simple CVE JSON 5 file`, async () => {
    const cveRecord = CveRecord.fromJsonFile(kFixtureCve_1999_0001);
    expect(cveRecord.cveId).toEqual(kCveId);
    expect(cveRecord.cveMetadata?.cveId).toEqual(kCveId);
    expect(cveRecord.dataType).toEqual(kCveRecord);
    expect(cveRecord.dataVersion).toEqual(kCveDataVersion);
  });


  it(`correctly reads in a simple CVE JSON 5 file and outputs it`, async () => {
    const cveService = new CveService();
    const cve = await cveService.getCveUsingId(kCveId);
    const filepath = './test/outputFromCveRecordV5.json';
    cve.writeJsonFile(filepath);
    const cve2 = CveRecord.fromJsonFile(filepath);
    // console.log(`cve.toJsonString:`, cve.toJsonString());
    expect(cve.toJsonString(false)).toEqual(cve2.toJsonString(false));
    expect(cve.cveId).toEqual(kCveId);
  });


  it(`correctly reads in a simple CVE JSON 5 file and outputs it to the cve path`, async () => {
    const cveService = new CveService();
    const cve = await cveService.getCveUsingId(kCveId);
    const repositoryRoot = `${process.env.CVES_TEST_BASE_DIRECTORY}`;
    const fullPath = cve.writeToCvePath(repositoryRoot);
    expect(FsUtils.exists(fullPath)).toBeTruthy();
  });

});
