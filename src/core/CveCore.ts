/**
 *  CveCore is made up of mostly the metadata portion of a CVE JSON 5 object
 *    plus (eventually) of additional metadata (such as SHA) that is useful for managing/validating CVEs
 */

import { CveId, CveIdError } from './CveId.js';
import { CveMetadata } from '../generated/quicktools/CveRecordV5.js';
import { CveRecord } from './CveRecord.js';
// import { IsoDateString } from '../common/IsoDateString.js';

export { CveId, CveIdError } from './CveId.js';


// @todo should change IsoDate to IsoDateString
type IsoDate = string;  // note, not exported, not an IsoDateString yet

export class CveCore {
  cveId: CveId;
  state?: string;//"RESERVED" | "PUBLISHED" | "REJECTED";
  assignerOrgId?: string;
  assignerShortName?: string;
  dateReserved?: IsoDate;
  datePublished?: IsoDate;
  dateUpdated?: IsoDate;

  // constructors and factories

  constructor(cveId: string | CveId) {
    this.cveId = (cveId instanceof CveId) ? cveId : new CveId(cveId);
  }

  static fromCveMetadata(metadata: Partial<CveMetadata>): CveCore {
    let obj = new CveCore(metadata?.cveId);
    obj.state = metadata?.state;
    obj.assignerOrgId = metadata?.assignerOrgId;
    obj.assignerShortName = metadata?.assignerShortName;
    obj.dateReserved = metadata?.dateReserved;
    obj.datePublished = metadata?.datePublished;
    // obj.dateUpdated = metadata?.dateUpdated;
    return obj;
  }

  /**
   * returns the CveId from a full or partial path (assuming the file is in the repository directory)
   *  @param path the full or partial file path to CVE JSON file
   *  @returns the CveId calculated from the filename, or "" if not valid
   */
  static getCveIdfromRepositoryFilePath(path: string): string {
    if (path) {
      return path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
    }
    else {
      return '';
    }
  }


  /**
   * returns the CveId from a full or partial path (assuming the file is in the repository directory)
   *  @param path the full or partial file path to CVE JSON file
   *  @returns the CveId calculated from the filename
   */
  static fromRepositoryFilePath(path: string): CveCore {
    try {
      return new CveCore(CveCore.getCveIdfromRepositoryFilePath(path));
    }
    catch {
      throw new CveIdError(`Error in parsing repository file path:  ${path}`);
    }

  }

  /** returns a CveCore object from a CveRecord */
  static fromCveRecord(cveRecord: CveRecord): CveCore {
    return this.fromCveMetadata(cveRecord.cveMetadata);
  }

  toJson(whitespace = 2): string {
    return JSON.stringify(this, (k, v) => v ?? undefined, whitespace);
  }

  getCvePath(): string {
    return this.cveId.getCvePath();
  }


}