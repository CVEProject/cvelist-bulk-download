/**
 *  CveId is an object that represents a CVE ID and provides 
 *  helper functions to use it
 */

import process from 'process';
import * as dotenv from 'dotenv';
dotenv.config();


export class CveIdError extends Error { }

export type CveIdComponents = [
  boolean,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined
];

export class CveId {

  /** internal representation of the CVE ID */
  id: string;

  // constructors and factories

  /**
   * @param id a CveId instance or a string representing a CVE ID (e.g., CVE-1999-0001)
   * @throws CveIdError if id is not a valid CVE ID
   */
  constructor(id: string | CveId) {
    if (CveId.toCvePath(id)) {
      this.id = (id instanceof CveId) ? id.id : id;
    }
    // else {
    //   throw new CveIdError(`Error in CVE ID:  ${id}`);
    // }
  }

  /** returns the CVE ID as a string */
  toString(): string {
    return this.id;
  }

  /** properly outputs the CVE ID in JSON.stringify() */
  toJSON() {
    return this.id;
  }

  /**
   * returns the partial CVE Path based on the CVE ID
   * @returns the partial CVE path, e.g., 1999/0xxx/CVE-1999-0001
   */
  getCvePath(): string {
    return CveId.toCvePath(this.id);
  }

  /**
   * returns the full CVE Path based on the CVEID and pwd
   * @returns the full CVE Path, e.g., /user/cve/cves/1999/0xxx/CVE-1999-0001
   */
  getFullCvePath(): string {
    return `${process.cwd()}/${process.env.CVES_BASE_DIRECTORY}/${CveId.toCvePath(this.id)}`;
  }

  /**
   * returns the official CVEProject/cvelistV5 URL to this CVE ID
   */
  getRawGithubUrl(/*official=true*/): string {
    // if ( official ) {
    return `https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/${CveId.getCveDir(this.id)}/${this.id}.json`;
    // }
  }

  // ----- static functions ----- ----- ----- -----

  // lazily initialized in getAllYears()
  private static _years: number[] = [];


  /**
   * checks if a string is a valid CveID
   *  @param id a string to test for CveID validity
   *  @returns a tuple:
   *    [0]:  (boolean) true iff valid CveID
   *    [1]:  (string) "CVE"
   *    [2]:  (string) year
   *    [3]:  (string) id/thousands
   *    [4]:  (string) id
   *    For example, CVE-1999-12345 would return
   *    [true,"CVE","1999","12xxx", "12345"]
   */
  static toComponents(cveId: string | CveId): CveIdComponents {
    const id: string = (cveId instanceof CveId) ? cveId.id : cveId;
    // assume a tup representing an invalid CVE ID
    const tup: CveIdComponents = [false, undefined, undefined, undefined, undefined];
    if (id === null || id === undefined || id?.length === 0) {
      return tup;
    }
    const parts = id.split('-');
    if (parts.length < 2) {
      return tup;
    }

    const year = parseInt(parts[1]);
    const num = parseInt(parts[2]);
    if (parts[0] === 'CVE'
      && CveId.getAllYears().includes(year)
      && num >= 1) {
      parts.shift();  // removes the 'CVE'
      const thousands = Math.floor(num / 1000).toFixed(0);
      return [true, "CVE", parts[0], `${thousands}xxx`, parts[1]];
    }
    else {
      return tup;
    }
  }


  /**
   * checks if a string is a valid CveID
   *  @param id a string to test for CveID validity
   *  @returns true iff str is a valid CveID
   */
  static isValidCveId(id: string): boolean {
    return CveId.toComponents(id)[0];
  }


  /** returns an array of CVE years represented as numbers [1999...2025]
   *  the algorithm takes the current year from the current (local) time,
   *    then adds 2 more years to end to accommodate future CVEs, 
   *    and adds 1970 in front
   */
  static getAllYears(): ReadonlyArray<number> {
    if (CveId._years.length === 0) {
      // uninitialized, so initialize it
      const startYear = 1999;
      // @todo note the following uses local time
      // @todo note hard-coded offset
      const endYear = new Date().getFullYear() + 2;
      const valid_cve_years_plus = [...Array(endYear - startYear + 1).keys()].map(i => i + startYear);
      CveId._years = [
        1970, // used for testing, valiating
        ...valid_cve_years_plus
      ];
    }
    return CveId._years;
  }


  /** given a cveId, returns the git hub repository partial directory it should go into 
   *  @param cveId string or CveId object representing the CVE ID (e.g., CVE-1999-0001)
   *  @returns string representing the partial path the cve belongs in (e.g., /1999/1xxx)
  */
  static getCveDir(cveId: string | CveId): string {
    const tup = CveId.toComponents(cveId);
    if (tup[0] === true) {
      return `${tup[2]}/${tup[3]}`;
    }
    else {
      throw new CveIdError(`Invalid CVE ID:  ${cveId}`);
    }
  }

  /** given a cveId, returns the git hub repository partial path (directory and filename without extension) it should go into
   *  @param cveId string representing the CVE ID (e.g., CVE-1999-0001)
   *  @returns string representing the partial path the cve belongs in (e.g., /1999/1xxx/CVE-1999-0001)
   */
  static toCvePath(cveId: string | CveId): string {
    // const id = (cveId instanceof CveId) ? cveId.id : cveId;
    const dir = CveId.getCveDir(cveId);
    return `${dir}/${cveId}`;
  }

}