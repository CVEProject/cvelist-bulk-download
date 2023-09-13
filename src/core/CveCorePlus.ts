/**
 *  CveCorePlus extends CveCore by adding things that are useful
 *  for various purposes (e.g., activity logs, delta, twitter):
 *  Currently, it adds:
 *    - description from container.cna.description
 *    - githubLink calculated based on GH_OWNER and GH_REPO currently running in
 */

import fs from 'fs';
import * as dotenv from 'dotenv';

import { CveId } from './CveId.js';
import { CveCore } from './CveCore.js';
import { CveMetadata } from '../generated/quicktools/CveRecordV5.js';
import { CveRecord } from './CveRecord.js';
import { FsUtils } from './fsUtils.js';

export { CveId } from './CveId.js';
export { CveCore } from './CveCore.js';

dotenv.config();

export class CveCorePlus extends CveCore {
  description?: string;
  githubUrl?: string;

  /** optional field for storing timestamp when the update github action added
   *  this to the repository
   */
  // timestampWhenCachedOnGithub?: IsoDateString; //@todo

  // ----- constructors and factories ----- ----- ----- ----- -----

  /**
   * constructor which builds a minimum CveCore from a CveId or string
   * @param cveId a CveId or string
   */
  constructor(cveId: string | CveId) {
    super(cveId);
  }

  /** factory method that synchronously reads in a CVE Record from a CVE JSON 5.0 formatted file
   *  @param relFilepath relative or full path to the file
   *  @returns a CveCorePlus object or undefined if the JSON file cannot be read
   */
  static fromJsonFile(relFilepath: string): CveCorePlus | undefined {
    if (FsUtils.exists(relFilepath)) {
      const cveStr = fs.readFileSync(relFilepath, {
        encoding: 'utf8',
        flag: 'r',
      });
      const obj = JSON.parse(cveStr);

      const cp = CveCorePlus.fromCveMetadata(obj.cveMetadata);
      // console.log(`cveCorePlus = ${JSON.stringify(cp, null, 2)}`);
      cp.updateFromLocalRepository();
      cp.githubUrl = cp.cveId.getRawGithubUrl();
      return cp;
    } else {
      console.log(`Error:  ${relFilepath} does not exist`);
      return undefined;
    }
  }

  /**
   * builds a full CveCorePlus using provided metadata
   * @param metadata the CveMetadata in CVE JSON 5.0 schema
   * @returns
   */
  static fromCveMetadata(metadata: Partial<CveMetadata>): CveCorePlus {
    // console.log(`metadata=${JSON.stringify(metadata, null, 2)}`)
    const obj = new CveCorePlus(metadata?.cveId);
    obj.set(metadata);
    return obj;
  }

  /**
   * builds a full CveCorePlus from a CveCore
   * @param cveCore a CveCore object
   * @returns a CveCorePlus object
   */
  static fromCveCore(cveCore: CveCore): CveCorePlus {
    const obj = new CveCorePlus(cveCore?.cveId);
    obj.state = cveCore?.state;
    obj.assignerOrgId = cveCore?.assignerOrgId;
    obj.assignerShortName = cveCore?.assignerShortName;
    obj.dateReserved = cveCore?.dateReserved;
    obj.datePublished = cveCore?.datePublished;
    obj.dateUpdated = cveCore?.dateUpdated;
    return obj;
  }


  /**
   * builds a full CveCorePlus from a CveCore
   * @param cveCore a CveCore object
   * @returns a CveCorePlus object
   */
  static fromCveRecord(cve: CveRecord): CveCorePlus {
    const obj = new CveCorePlus(cve?.cveId);
    obj.state = cve?.cveMetadata?.state;
    obj.assignerOrgId = cve?.cveMetadata?.assignerOrgId;
    obj.assignerShortName = cve?.cveMetadata?.assignerShortName;
    obj.dateReserved = cve?.cveMetadata?.dateReserved;
    obj.datePublished = cve?.cveMetadata?.datePublished;
    obj.dateUpdated = cve?.cveMetadata?.dateUpdated;
    obj.description = cve?.getDescription();
    return obj;
  }

  // ----- accessors and mutators ----- ----- ----- -----

  /**
   * update CveCorePlus with additional data from the repository
   * @returns true iff a JSON file was found and readable to fill in
   * ALL the fields in the CveCorePlus data structure
   */
  updateFromLocalRepository(): boolean {
    const filepath = `${this.cveId.getFullCvePath()}.json`;
    console.log(`filepath=${filepath}`);
    const cve = CveRecord.fromJsonFile(filepath);
    if (cve) {
      this.set(cve.cveMetadata);
      this.description = cve.getDescription('en');
      return true;
    }
    return false;
  }

}
