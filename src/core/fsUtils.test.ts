import fs from 'fs';

import { FsUtils } from './fsUtils.js';

const kTestFixtureCve5Dir = './test/fixtures/cve/5';
const kTestFixtureCve0001 = './test/fixtures/cve/5/CVE-1970-0001.json';
const kTestFixtureCve0001u = './test/fixtures/cve/5/CVE-1970-0001u.json';
const kTestFixtureCve0002 = './test/fixtures/cve/5/CVE-1970-0002.json';
const kTestRepoCve0003 = './test/pretend_github_repository/1970/0xxx/CVE-1970-0003.json';

describe(`FileSystem`, () => {

  const testDir = `test/tests/filesystem`;
  const testZip = `${testDir}/test.zip`;

  it(`ls() lists all files in a path`, async () => {
    const list = FsUtils.ls(kTestFixtureCve5Dir);
    console.log(list);
    expect(list.length).toBe(14);
    expect(list[0]).toMatch(`CVE-1970-0001.json`);
  });

  it(`isSameContent() returns true if 2 files are identical`, async () => {
    expect(FsUtils.isSameContent(kTestFixtureCve0001, kTestFixtureCve0001)).toBeTruthy();
  });

  it(`isSameContent() returns false if 2 files are different`, async () => {
    expect(FsUtils.isSameContent(kTestFixtureCve0001, kTestFixtureCve0002)).toBeFalsy();
  });

  it(`isSameContent() returns false if a file is missing`, async () => {
    expect(FsUtils.isSameContent('', kTestFixtureCve0002)).toBeFalsy();
  });


  it('deleteProperties() can delete complex paths from JSON', () => {
    let json = {
      a: {
        b: {
          c: 1,
          d: 2
        }
      }
    };
    expect(FsUtils.deleteProperties(json, "a.b.c")).toEqual({
      a: {
        b: {
          d: 2
        }
      }
    });
    expect(json.a.b.c).toBeUndefined();
  });


  it(`isSameContent() properly compares JSON objects using optional ignore property paths`, async () => {
    expect(FsUtils.isSameContent(
      kTestFixtureCve0001,
      kTestFixtureCve0001u)
    ).toBeFalsy();
    expect(FsUtils.isSameContent(
      kTestFixtureCve0001,
      kTestFixtureCve0001u,
      ["cveMetadata.state", "cveMetadata.datePublished", "cveMetadata.dateUpdated", "cveMetadata.dateReserved"])
    ).toBeTruthy();
  });


  it(`generateZipfile() zips a single text file to default virtual zip dir`, async () => {
    const filespath = [kTestFixtureCve0001];
    FsUtils.generateZipfile(filespath, testZip);
    expect(fs.existsSync(testZip)).toBeTruthy();
    fs.rmSync(testZip);
  });


  it(`generateZipfile() zips a single text file to a specified virtual zip dir`, async () => {
    const filespath = [kTestFixtureCve0001];
    FsUtils.generateZipfile(filespath, testZip, 'deltaCves');
    expect(fs.existsSync(testZip)).toBeTruthy();
    // @todo currently only testing manually to see that when unzipped, the resulting directory is called deltaCves
    fs.rmSync(testZip);
  });


});