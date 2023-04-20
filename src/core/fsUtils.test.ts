import * as dotenv from 'dotenv';
import fs from 'fs';

import { FsUtils } from './fsUtils.js';

const kTestFixtureCve5Dir = './test/fixtures/cve/5';
const kTestFixtureCve0001 = './test/fixtures/cve/5/CVE-1970-0001.json';
const kTestFixtureCve0002 = './test/fixtures/cve/5/CVE-1970-0002.json';
const kTestRepoCve0003 = './test/pretend_github_repository/1970/0xxx/CVE-1970-0003.json';

dotenv.config();

describe(`FileSystem`, () => {

  const testDir = `test/tests/filesystem`;
  const testZip = `${testDir}/test.zip`;

  it(`ls() lists all files in a path`, async () => {
    const list = FsUtils.ls(kTestFixtureCve5Dir);
    console.log(list);
    expect(list.length).toBe(13);
    expect(list[0]).toMatch(`CVE-1970-0001.json`);
  });


  it(`generateZipfile() zips a single text file to default virtual zip dir`, async () => {
    const filespath = [kTestFixtureCve0001];
    FsUtils.generateZipfile(filespath, testZip);
    expect(fs.existsSync(testZip)).toBeTruthy();
    fs.rmSync(testZip);
  });

  // it(`generateZipfile() zips a single text file to default virtual zip dir`, async () => {
  //   const filespath = [kTestFixtureCve0001];
  //   FsUtils.generateZipfile(filespath, testZip);
  //   expect(fs.existsSync(testZip)).toBeTruthy();
  //   fs.rmSync(testZip);
  // });


  it(`generateZipfile() zips a single text file to a specified virtual zip dir`, async () => {
    const filespath = [kTestFixtureCve0001];
    FsUtils.generateZipfile(filespath, testZip, 'deltaCves');
    expect(fs.existsSync(testZip)).toBeTruthy();
    // @todo currently only testing manually to see that when unzipped, the resulting directory is called deltaCves
    fs.rmSync(testZip);
  });


});