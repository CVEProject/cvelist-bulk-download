import { CveCore, CveIdError } from './CveCore.js';
import { CveRecord } from './CveRecord.js';


// test CVEs

import * as kCve1999_0001_file from '../../test/pretend_github_repository/1999/0xxx/CVE-1999-0001.json';

describe(`CveCore`, () => {

  const kCve1999_0001 = {
    cveId: 'CVE-1999-0001',
    state: 'PUBLISHED',
    assignerOrgId: '8254265b-2729-46b6-b9e3-3dfca2d5bfca',
    assignerShortName: 'mitre',
    dateReserved: '1999-06-07T00:00:00',
    datePublished: '2000-02-04T05:00:00',
    dateUpdated: undefined
  };

  it(`constructor properly creates a CveCore`, async () => {
    const obj = new CveCore(`CVE-1970-0001`);
    expect(obj.cveId.id).toMatch(`CVE-1970-0001`);
    expect(obj.toJson(0)).toEqual(`{"cveId":"CVE-1970-0001"}`);
  });


  it(`fromCveMetadata() properly creates a CveCore`, async () => {
    // const cve: CveRecord = new CveRecord(JSON.parse(JSON.stringify(kCve1999_0001_file)));
    const obj = CveCore.fromCveMetadata(kCve1999_0001);
    // console.log(obj);
    expect(obj.cveId.id).toEqual(kCve1999_0001.cveId);
  });

  it(`getCveIdfromRepositoryFilePath() properly returns an empty string if path does not point to a valid CVE object`, async () => {
    expect(CveCore.getCveIdfromRepositoryFilePath(undefined)).toMatch(``);
    expect(CveCore.getCveIdfromRepositoryFilePath(null)).toMatch(``);
    expect(CveCore.getCveIdfromRepositoryFilePath("file.json")).toMatch(``);
  });

  it(`fromRepositoryFilePath() properly creates a CveCore`, async () => {
    let obj = CveCore.fromRepositoryFilePath(`preview_cves/2016/15xxx/CVE-2016-15029.json`);
    expect(obj.cveId.id).toEqual(`CVE-2016-15029`);
    obj = CveCore.fromRepositoryFilePath(`/Users/abc/preview_cves/2020/21xxx/CVE-2020-21365.json`);
    expect(obj.cveId.id).toEqual(`CVE-2020-21365`);
  });

  it(`fromRepositoryFilePath() throws errors if improper CVE ID`, async () => {
    expect(() => { CveCore.fromRepositoryFilePath(undefined); }).toThrow(CveIdError);
    expect(() => { CveCore.fromRepositoryFilePath(null); }).toThrow(CveIdError);
    expect(() => { CveCore.fromRepositoryFilePath("file.json"); }).toThrow(CveIdError);
  });

  it(`fromCveRecord() properly creates a CveCore`, async () => {
    const cve: CveRecord = new CveRecord(JSON.parse(JSON.stringify(kCve1999_0001_file)));
    const obj = CveCore.fromCveRecord(cve);
    // console.log(obj);
    expect(obj.cveId.id).toEqual(kCve1999_0001.cveId);
  });


});