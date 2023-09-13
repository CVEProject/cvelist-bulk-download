/**
 *  CveCore is made up of the metadata portion of a CVE JSON 5 object
 *  Note that it is convenient to store additional data for some operations,
 *  and for that, the CveCorePlus object should be used
 */

import { CveId, CveIdError } from './CveId.js';
import { CveMetadata } from '../generated/quicktools/CveRecordV5.js';
import { CveRecord } from './CveRecord.js';
// import { IsoDateString } from '../common/IsoDateString.js';
import fs from 'fs';

export { CveId, CveIdError } from './CveId.js';

// @todo should change IsoDate to IsoDateString
type IsoDate = string; // note, not exported, not an IsoDateString yet

export class CveCore {
  cveId: CveId;
  state?: string; //"RESERVED" | "PUBLISHED" | "REJECTED";
  assignerOrgId?: string;
  assignerShortName?: string;
  dateReserved?: IsoDate;
  datePublished?: IsoDate;
  dateUpdated?: IsoDate;

  // ----- constructors and factories ----- ----- ----- ----- -----

  /**
   * constructor which builds a minimum CveCore from a CveId or string
   * @param cveId a CveId or string
   */
  constructor(cveId: string | CveId) {
    this.cveId = cveId instanceof CveId ? cveId : new CveId(cveId);
  }

  /**
   * builds a full CveCore using provided metadata
   * @param metadata the CveMetadata in CVE JSON 5.0 schema
   * @returns
   */
  static fromCveMetadata(metadata: Partial<CveMetadata>): CveCore {
    const obj = new CveCore(metadata?.cveId);
    obj.set(metadata);
    return obj;
  }

  // ----- accessors and mutators ----- ----- ----- -----

  set(metadata: Partial<CveMetadata>): void {
    this.state = metadata?.state;
    this.assignerOrgId = metadata?.assignerOrgId;
    this.assignerShortName = metadata?.assignerShortName;
    this.dateReserved = metadata?.dateReserved;
    this.datePublished = metadata?.datePublished;
    this.dateUpdated = metadata?.dateUpdated;
  }

  // updateFromJsonString(jsonstr: string) {}

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

  getCvePath(): string {
    return this.cveId.getCvePath();
  }
}