/**
 * CVE Object that wraps various CVE-related operations into a single object, including
 *  - read in a CVE Record JSON v5 format file
 *  - auto-convert CVE Record JSON v5 format string to Cve5 object
 *  - output as optionally prettyprinted JSON 5 string
 *  - write to a file or to proper repository location
 * 
 * @todo refactoring CVE IDs from string to CveId.  Currently, only using CveId class methods, but
 *  the data member cveId is still just a string
 */
import fs from 'fs';
import path from 'path';

import { CveId, CveIdError } from './CveId.js';
import { CveRecordV5, CveMetadata, Containers } from '../generated/quicktools/CveRecordV5.js';

export { CveId, CveIdError } from './CveId.js';

export interface WriteFileOptions {
  prettyprint?: boolean;
}

export class CveRecord implements CveRecordV5 {

  _defaultOutdir = process.env.CVE_UTILS_DEFAULT_OUTDIR;
  cveId: string;    // note we are still only using strings for CVE ID in CVE
  containers: Containers;
  cveMetadata: CveMetadata;
  dataType?: string;
  dataVersion?: number;
  sourceObj: {};


  /** reads in a proper CVE Record JSON v5 format obj (e.g., JSON.parse()'d content of a file or the response from the CVE API 2.1) 
   *  @param obj a Javascript object that conforms to the CVE Record JSON v5 format specification
   *  @todo verify it is a CVE Record JSON v5 format format that we know how to work with
  */
  constructor(obj: CveRecordV5) {
    this.sourceObj = obj;
    this.cveId = obj['cveMetadata']?.cveId;
    this.containers = obj['containers'];
    this.cveMetadata = obj['cveMetadata'];
    this.dataType = obj['dataType'];
    this.dataVersion = obj['dataVersion'];
  }


  /** factory method that synchronously reads in a CVE Record from a CVE JSON 5.0 formatted file
   *  @param relFilepath relative or full path to the file
   *  @returns a CveRecord
   */
  static fromJsonFile(relFilepath: string): CveRecord {
    const cveStr = fs.readFileSync(relFilepath, { encoding: 'utf8', flag: 'r' });
    const obj = JSON.parse(cveStr);
    return new CveRecord(obj);
  }


  /** returns the git hub repository partial path this CveRecord should go into 
   *  @returns string representing the partial path the cve belongs in (e.g., /1999/1xxx/CVE-1999-0001)
  */
  toCvePath(): string {
    return CveId.toCvePath(this.cveId);
  }


  /** prints object in JSON format
   *  @param prettyPrint boolean to set pretty printing (default is true)
   *  @returns a JSON string
   */
  toJsonString(prettyPrint: boolean = true): string {
    if (prettyPrint) {
      return JSON.stringify(this.sourceObj, null, 4);
    }
    else {
      return JSON.stringify(this.sourceObj, null, 0);
    }
  }


  /** writes a CVE Record to a file in CVE JSON 5.0 format
   *  @param relFilepath relative path to the file
   *  @param prettyprint boolean to set whether to pretty print the output
   */
  writeJsonFile(relFilepath: string, prettyprint: boolean = true): void {
    const value = this.toJsonString(prettyprint);
    const dirname = path.dirname(relFilepath);
    fs.mkdirSync(dirname, { recursive: true });
    fs.writeFileSync(`${relFilepath}`, value);
  }


  /** writes a CVE Record to a file in CVE JSON 5.0 format
   *  @param repositoryRoot path where the repository is (the full path will be determined by the CveID)
   *  @param prettyprint boolean to set whether to pretty print the output
   *  @returns the full path where the file was written to
   */
  writeToCvePath(repositoryRoot: string, prettyprint: boolean = true): string {
    const fullpath = `${repositoryRoot}/${this.toCvePath()}.json`;
    this.writeJsonFile(fullpath, prettyprint);
    return fullpath;
  }
}
