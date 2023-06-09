import * as dotenv from 'dotenv';

import { CveService } from './CveService.js';

dotenv.config();

describe(`CveService`, () => {

  // constants that may change as database changes
  const kCveId = `CVE-1999-0001`;
  const kTotalCves = 114;
  const kLastCveModifiedTime = `2023-01-15T15:56:15`;

  it(`correctly sets up the CVE service required environment variables from .env`, async () => {
    const cveService = new CveService();
    expect(cveService._headers)
      .toEqual(
        {
          "Content-Type": "application/json",
          "CVE-API-ORG": `${process.env.CVE_API_ORG}`,
          "CVE-API-USER": `${process.env.CVE_API_USER}`,
          "CVE-API-KEY": `${process.env.CVE_API_KEY}`,
          "redirect": "follow"
        });
  });


  it(`getCveSummary() gets summary of CVEs`, async () => {
    const cveService = new CveService();
    const info = await cveService.getCveSummary();
    expect(info['totalCves']).toBeGreaterThan(200000);
  }, (30 * 1000));


  it(`getCveUsingId() gets correct CVE using a valid CVE id`, async () => {
    const cveService = new CveService();
    const cve = await cveService.getCveUsingId(kCveId);
    expect(
      cve?.cveMetadata?.cveId
    ).toEqual(
      kCveId
    );
  });


  it(`getCveUsingId() correctly throws an exception for invalid CVE id`, async () => {
    const cveService = new CveService();
    await expect(cveService.getCveUsingId(`bad cve id`))
      .rejects
      .toThrow(`Invalid CVE ID`);
  });


  it(`getAllCvesChangedInTimeFrame() gets correct set of CVEs`, async () => {
    const cveService = new CveService();
    const cves = await cveService.getAllCvesChangedInTimeFrame('2022-10-14T17:00:00', '2022-10-14T17:10:00');
    expect(cves.length).toBeGreaterThanOrEqual(1);
  });

  // ----- API wrapper

  it(`cve() gets correct CVE using a CVE id`, async () => {
    const cveService = new CveService();
    const response = await cveService.cve({ id: kCveId });
    expect(
      response
    ).toMatchObject(
      {
        "cveMetadata": {
          "cveId": expect.stringMatching(`${kCveId}`),
        },
        "dataVersion": "5.0"
      }
    );
    expect(response.cveMetadata).toHaveProperty("assignerOrgId");
  });


  it(`cve() gets total number of CVEs`, async () => {
    const cveService = new CveService();
    const response = await cveService.cve({ queryString: 'count_only=1' });
    expect(response.totalCount).toBeGreaterThan(100);
    // console.log(`~~total number of CVEs=${response.totalCount}`);
  });


  it(`cve() correctly handles '?' in query parameter`, async () => {
    const cveService = new CveService();
    const response = await cveService.cve({ queryString: '?count_only=1' });
    expect(response.totalCount).toBeGreaterThan(100);
    // console.log(`~~total number of CVEs=${response.totalCount}`);
  });


  it(`cve() gets CVEs changed since ${kLastCveModifiedTime}`, async () => {
    const cveService = new CveService();
    const response = await cveService.cve({ queryString: `count_only=1&time_modified.gt=${kLastCveModifiedTime}` });
    expect(response['totalCount']).toBeGreaterThanOrEqual(1);
    // console.log(`~~CVEs changed since ${kLastCveModifiedTime}=${response['totalCount']}`);
  });

});
