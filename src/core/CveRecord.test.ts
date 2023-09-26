import { CveRecord } from './CveRecord.js';
import { CveService } from '../net/CveService.js';
import { FsUtils } from './fsUtils.js';

describe(`CveRecord object`, () => {

  // common constants throughout tests
  const kCveId = `CVE-1999-0001`;
  const kFixtureCve_1999_0001 = `./cves/1999/0xxx/${kCveId}.json`;
  const kCveRecord = `CVE_RECORD`;
  const kCveDataVersion = '5.0';
  const kCveDescription =
    'ip_input.c in BSD-derived TCP/IP implementations allows remote attackers to cause a denial of service (crash or hang) via crafted packets.';

  const kCveId2 = `CVE-1970-0004`;
  const kFixtureCve_1970_0998 = `./test/fixtures/cve/5/${kCveId2}.json`;
  const kCveDescription2a = 'test file';
  const kCveDescription2b = `British version:  ${kCveDescription2a}`;
  const kCveDescription2c = 'French version:  fichier de test';

  it(`correctly represents a simple CVE in JSON 5 format`, async () => {
    const cveService = new CveService();
    const cve = await cveService.getCveUsingId(kCveId);
    expect(cve?.cveId).toEqual(kCveId);
    expect(cve?.cveMetadata?.cveId).toEqual(kCveId);
    expect(cve?.dataType).toEqual(kCveRecord);
    expect(cve?.dataVersion).toEqual(kCveDataVersion);
  });

  it(`fromCveId() correctly builds a CVE Record from a CVE ID using fixtures in the test directory`, async () => {
    const cveRecord = CveRecord.fromCveId(kCveId);
    console.log(`cveRecord=${cveRecord}`)
    expect(cveRecord.cveId).toEqual(kCveId);
    expect(cveRecord.cveMetadata?.cveId).toEqual(kCveId);
    expect(cveRecord.dataType).toEqual(kCveRecord);
    expect(cveRecord.dataVersion).toEqual(kCveDataVersion);
    expect(cveRecord.getDescription()).toEqual(kCveDescription);
  });

  it(`fromCveId() correctly builds a CVE Record from a CVE ID using the partial /cves directory`, async () => {
    const cveRecord = CveRecord.fromCveId(kCveId);
    expect(cveRecord.cveId).toEqual(kCveId);
    expect(cveRecord.cveMetadata?.cveId).toEqual(kCveId);
    expect(cveRecord.dataType).toEqual(kCveRecord);
    expect(cveRecord.dataVersion).toEqual(kCveDataVersion);
    expect(cveRecord.getDescription()).toEqual(kCveDescription);
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
    const filepath = './test/temp/outputFromCveRecordV5.json';
    cve.writeJsonFile(filepath);
    const cve2 = CveRecord.fromJsonFile(filepath);
    // console.log(`cve.toJsonString:`, cve.toJsonString());
    expect(cve.toJsonString(false)).toEqual(cve2.toJsonString(false));
    expect(cve.cveId).toEqual(kCveId);
    FsUtils.rm(filepath)
  });

  it(`correctly reads in a simple CVE JSON 5 file and outputs it to the cve path`, async () => {
    const cveService = new CveService();
    const cve = await cveService.getCveUsingId(kCveId);
    const repositoryRoot = `./test/temp`;
    const fullPath = cve.writeToCvePath(repositoryRoot);
    expect(FsUtils.exists(fullPath)).toBeTruthy();
    FsUtils.rm(fullPath)
  });

  it(`correctly reads in the description when using a simple 2 letter country code `, async () => {
    const cveRecord = CveRecord.fromJsonFile(kFixtureCve_1970_0998);
    expect(cveRecord.cveId).toEqual(kCveId2);
    expect(cveRecord.getDescription()).toEqual(kCveDescription2a);
    expect(cveRecord.getDescription('en')).toEqual(kCveDescription2a);
    expect(cveRecord.getDescription('fr')).toEqual(kCveDescription2c);
    expect(cveRecord.getDescription('zw')).toBeUndefined();
  });

  it(`correctly reads in the description when using 2 letter + dialect code`, async () => {
    const cveRecord = CveRecord.fromJsonFile(kFixtureCve_1970_0998);
    expect(cveRecord.cveId).toEqual(kCveId2);
    expect(cveRecord.getDescription()).toEqual(kCveDescription2a);
    expect(cveRecord.getDescription('En-US')).toEqual(kCveDescription2a);
    expect(cveRecord.getDescription('en-uk')).toEqual(kCveDescription2b);
  });
});
