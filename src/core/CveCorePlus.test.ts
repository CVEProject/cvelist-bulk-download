import { CveId, CveCore, CveCorePlus } from './CveCorePlus.js';
import { CveRecord } from './CveRecord.js';

const kDescription = `ip_input.c in BSD-derived TCP/IP implementations allows remote attackers to cause a denial of service (crash or hang) via crafted packets.`;

describe(`CveCorePlus`, () => {
  const kCve1999_0001 = {
    cveId: 'CVE-1999-0001',
    state: 'PUBLISHED',
    assignerOrgId: '8254265b-2729-46b6-b9e3-3dfca2d5bfca',
    assignerShortName: 'mitre',
    dateReserved: '1999-06-07T00:00:00',
    datePublished: '2000-02-04T05:00:00',
    dateUpdated: '2005-12-17T00:00:00',
    description: kDescription
  };

  it(`constructor() properly creates a CveCorePlus object equivalent to a CveCore obj`, async () => {
    const cp = new CveCorePlus(kCve1999_0001.cveId);
    const core = new CveCore(kCve1999_0001.cveId);
    expect(cp).toEqual(core);
  });

  it(`fromJsonFile() properly creates a full CveCorePlus object`, async () => {
    const cveId = new CveId(kCve1999_0001.cveId);
    const cp = CveCorePlus.fromJsonFile(`cves/${cveId.getCvePath()}.json`);
    console.log(`cp=${JSON.stringify(cp, null, 2)}`);
    expect(cp.cveId.toString()).toEqual(kCve1999_0001.cveId);
    expect(cp.state).toEqual(kCve1999_0001.state);
    expect(cp.assignerOrgId).toEqual(kCve1999_0001.assignerOrgId);
    expect(cp.assignerShortName).toEqual(kCve1999_0001.assignerShortName);
    expect(cp.dateReserved).toEqual(kCve1999_0001.dateReserved);
    expect(cp.datePublished).toEqual(kCve1999_0001.datePublished);
    expect(cp.dateUpdated).toEqual(kCve1999_0001.dateUpdated);
    expect(cp.description).toEqual(kCve1999_0001.description);
    expect(cp.githubUrl).toMatch('https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/1999/0xxx/CVE-1999-0001.json');
  });


  it(`fromCveMetadata() properly creates a CveCorePlus from a CveMetadata`, async () => {
    const cve = new CveCore(kCve1999_0001.cveId);
    cve.set(kCve1999_0001);
    // console.log(cve);
    expect(cve.cveId.id).toEqual(kCve1999_0001.cveId);
    expect(cve['description']).toBeUndefined();
    const cvep = CveCorePlus.fromCveCore(cve);
    // console.log(cvep);
    expect(cvep.cveId.id).toEqual(kCve1999_0001.cveId);
    expect(cvep.description).toBeUndefined();
  });

  it(`fromCveCore() properly creates a CveCorePlus from a CveCore`, async () => {
    const cve = new CveCore(kCve1999_0001.cveId);
    cve.set(kCve1999_0001);
    // console.log(cve);
    expect(cve.cveId.id).toEqual(kCve1999_0001.cveId);
    const cvep = CveCorePlus.fromCveCore(cve);
    // console.log(cvep);
    expect(cvep.cveId.id).toEqual(kCve1999_0001.cveId);
    expect(cvep.description).toBeUndefined();
  });

  it(`updateFromLocalRepository() properly creates a CveCore`, async () => {
    const cvep = new CveCorePlus(kCve1999_0001.cveId);
    const success = cvep.updateFromLocalRepository();
    expect(success).toBeTruthy();
    // console.log(cvep);
    expect(cvep.cveId.id).toEqual(kCve1999_0001.cveId);
    expect(cvep.datePublished).toEqual(kCve1999_0001.datePublished);
    expect(cvep.state).toEqual(kCve1999_0001.state);
    expect(cvep.assignerOrgId).toEqual(kCve1999_0001.assignerOrgId);
    expect(cvep.assignerShortName).toEqual(kCve1999_0001.assignerShortName);
    expect(cvep.dateReserved).toEqual(kCve1999_0001.dateReserved);
    expect(cvep.datePublished).toEqual(kCve1999_0001.datePublished);
    expect(cvep.dateUpdated).toEqual(kCve1999_0001.dateUpdated);
    expect(cvep.description).toMatch(kDescription);
  });
});
