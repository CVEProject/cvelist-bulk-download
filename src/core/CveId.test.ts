import { CveId, CveIdError } from './CveId.js';
import * as dotenv from 'dotenv';
dotenv.config();

describe(`CveId`, () => {

  // constants that may change as database changes
  const kCveId = `CVE-1999-0001`;
  const kFixtureFilepath = `./test/fixtures/cve/5`;
  const kFixtureCve_1999_0001 = `${kFixtureFilepath}/CVE-1999-0001.json`;
  const kCveRecord = `CVE_RECORD`;
  const kCveDataVersion = "5.0";


  it(`constructor correctly builds a CveId from a string`, async () => {
    const cveId = new CveId(kCveId);
    expect(cveId.id).toEqual(kCveId);
    expect(CveId.getCveDir(`${kCveId}`)).toEqual(`1999/0xxx`);
  });


  it(`constructor correctly builds a CveId from another CveId`, async () => {
    const cveId = new CveId(kCveId);
    const cveId2 = new CveId(cveId);
    expect(cveId2).toStrictEqual(cveId);
    expect(cveId2.toJSON()).toEqual(cveId2.toString());
    expect(CveId.getCveDir(`${kCveId}`)).toEqual(`1999/0xxx`);
    expect(CveId.toCvePath(cveId)).toEqual(`1999/0xxx/${cveId}`);
  });


  it(`constructor correctly throws an error if an invalid ID is passed`, async () => {
    expect(() => { new CveId('cve'); }).toThrow(CveIdError);
    expect(() => { new CveId('CVE-3000-0001'); }).toThrow(CveIdError);
    expect(() => { new CveId('CVE-1990-0001'); }).toThrow(`Invalid CVE ID`);
  });


  it(`correctly returns the CVE's repository path`, async () => {
    const cveId = new CveId(kCveId);
    expect(cveId.id).toEqual(kCveId);
    expect(cveId.getCvePath()).toEqual(`1999/0xxx/${kCveId}`);
  });


  it(`correctly returns the CVE's full path`, async () => {
    const cveId = new CveId(kCveId);
    expect(cveId.id).toEqual(kCveId);
    expect(cveId.getFullCvePath()).toEqual(`${process.cwd()}/${process.env.CVES_BASE_DIRECTORY}/1999/0xxx/${kCveId}`);
  });


  it(`correctly outputs the CVE ID using JSON.stringify()`, async () => {
    const cveId = new CveId(kCveId);
    const jsonStr = JSON.stringify(cveId);
    // console.log(`jsonStr = ${jsonStr}`);
    expect(jsonStr).toEqual(`"${cveId.id}"`);
  });


  // ----- static functinos ----- ----- ----- ----- -----


  it(`toComponents() should return proper CveIdComponents`, async () => {
    let cveId = 'CVE-1999-0001';
    expect(CveId.toComponents(cveId)).toEqual([true, "CVE", "1999", "0xxx", "0001"]);

    cveId = 'CVE-1999-12340001';
    expect(CveId.toComponents(cveId)).toEqual([true, "CVE", "1999", "12340xxx", "12340001"]);

    cveId = '';
    expect(CveId.toComponents(cveId)).toEqual([false, undefined, undefined, undefined, undefined]);

    // other examples are tested in tests for isValidCveId()
  });


  it(`isValidCveId() should return true iff a string is a valid CVE ID`, async () => {
    expect(CveId.isValidCveId('CVE-1999-0001')).toBeTruthy();

    expect(CveId.isValidCveId('')).toBeFalsy();
    expect(CveId.isValidCveId('abc')).toBeFalsy();
    expect(CveId.isValidCveId('bad id')).toBeFalsy();
    expect(CveId.isValidCveId(undefined)).toBeFalsy();
    expect(CveId.isValidCveId(null)).toBeFalsy();
    expect(CveId.isValidCveId('1999-0001')).toBeFalsy();
    expect(CveId.isValidCveId('cve-1999-0001')).toBeFalsy();
    expect(CveId.isValidCveId('-1999-0001')).toBeFalsy();
    expect(CveId.isValidCveId('CVE-1998-0001')).toBeFalsy();
    expect(CveId.isValidCveId('CVE-3000-0001')).toBeFalsy();
    expect(CveId.isValidCveId('CVE_1999_0001')).toBeFalsy();
  });


  it(`correctly returns the list of years CVEs have been registered`, async () => {
    const years = CveId.getAllYears();
    // console.log(years);
    expect(years)
      .toEqual(
        [
          1970,
          1999, 2000, 2001, 2002, 2003,
          2004, 2005, 2006, 2007, 2008,
          2009, 2010, 2011, 2012, 2013,
          2014, 2015, 2016, 2017, 2018,
          2019, 2020, 2021, 2022, 2023,
          2024, 2025
        ]);
  });


  it(`statically parses a valid cve id into a repository dir`, async () => {
    expect(CveId.getCveDir(`${kCveId}`)).toEqual(`1999/0xxx`);
    const cveId = `CVE-1970-0001`;
    expect(CveId.getCveDir(cveId)).toEqual(`1970/0xxx`);
  });


  it(`statically parses an invalid cve id and throws error`, async () => {
    expect(() => { CveId.getCveDir('1999-0000'); }).toThrow(CveIdError);
  });


  it(`statically parses any valid cve id string into a repository path`, async () => {
    expect(CveId.toCvePath(`${kCveId}`)).toEqual(`1999/0xxx/${kCveId}`);
    let cveId = `CVE-1999-0001`;
    expect(CveId.toCvePath(cveId)).toEqual(`1999/0xxx/${cveId}`);
    cveId = `CVE-1999-1001`;
    expect(CveId.toCvePath(cveId)).toEqual(`1999/1xxx/${cveId}`);
    cveId = `CVE-1999-1499`;
    expect(CveId.toCvePath(cveId)).toEqual(`1999/1xxx/${cveId}`);
    cveId = `CVE-1999-1500`;
    expect(CveId.toCvePath(cveId)).toEqual(`1999/1xxx/${cveId}`);
    cveId = `CVE-1999-1501`;
    expect(CveId.toCvePath(cveId)).toEqual(`1999/1xxx/${cveId}`);
    cveId = `CVE-1999-2000`;
    expect(CveId.toCvePath(cveId)).toEqual(`1999/2xxx/${cveId}`);
    cveId = `CVE-2023-53999`;
    expect(CveId.toCvePath(cveId)).toEqual(`2023/53xxx/${cveId}`);
    cveId = `CVE-2025-1000000001`;
    expect(CveId.toCvePath(cveId)).toEqual('2025/1000000xxx/CVE-2025-1000000001');
    cveId = `CVE-1970-0001`;
    expect(CveId.toCvePath(cveId)).toEqual(`1970/0xxx/${cveId}`);
  });


  it(`statically parses any valid CveId into a repository path`, async () => {
    let cveId: CveId = new CveId(`${kCveId}`);
    expect(CveId.toCvePath(cveId)).toEqual(`1999/0xxx/${kCveId}`);
    cveId = new CveId(`CVE-1999-0001`);
    expect(CveId.toCvePath(cveId)).toEqual(`1999/0xxx/${cveId.id}`);
  });


  it(`should catch invalid cve ids`, async () => {
    expect(() => { CveId.toCvePath('1999-0000'); }).toThrow(CveIdError);
    expect(() => { CveId.toCvePath('1999-0001'); }).toThrow(CveIdError);
    expect(() => { CveId.toCvePath('cve-1999-0001'); }).toThrow(CveIdError);
    expect(() => { CveId.toCvePath('-1999-0001'); }).toThrow(CveIdError);
    expect(() => { CveId.toCvePath('CVE-1998-0001'); }).toThrow(CveIdError);
    expect(() => { CveId.toCvePath('CVE-3000-0001'); }).toThrow(CveIdError);
    expect(() => { CveId.toCvePath('CVE_1999_0001'); }).toThrow(CveIdError);

    expect(() => { new CveId('CVE'); }).toThrow(CveIdError);
  });


});
