/**
 *  This is the Delta class.  A delta is a list of files in a directory whose content changed from time T1 to T2.
 *  Changes can be a new added file, updated file, or deleted file (though currently, we do not work with deleted
 *  files since no CVEs should ever be deleted once it is published).
 * 
 *  Note that this class REQUIRES git and a git history.  It does not look at files, only git commits in git history.
 *  So during testing, simply copying /cves from another directory WILL NOT WORK because git history
 *  does not have those commits.
 *  
 *  When making zip files, this class copies CVE JSON files from /cves to a directory, and zip that, so the /cves directory
 *  needs to be in the current directory
 */

import fs from 'fs';
import path from 'path';
import process from 'process';
import { simpleGit, SimpleGit, StatusResult } from 'simple-git';
import { cloneDeep } from 'lodash';

import { CveId, CveCore, CveCorePlus } from './CveCorePlus.js';
import { Git } from './git.js';
import { FsUtils } from './fsUtils.js';

export type IsoDate = string; // @todo make a better class
// export type CveId = string;   // @todo make a better class

export enum DeltaQueue {
  kNew = 1,
  kPublished,
  kUpdated,
  kUnknown
}

/**
 * Output JSON format for delta.json and deltaLog.json based on feedback
 * from the AWG on 8/22/2023 to keep the output simple
 * 
 * So internally, we are storing the full CveCorePlus, but externally,
 * and specifically when writing out to JSON, we are using this shortened format
 
 * see https://github.com/CVEProject/cvelistV5/issues/23 for some additional discussions
 * before and after the AWG meeting on 8/22
 */
export class DeltaOutpuItem {

  static _cveOrgPrefix = `https://www.cve.org/CVERecord?id=`;
  static _githubRawJsonPrefix = `https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/`

  cveId: string;          // string version of the CVE ID
  cveOrgLink?: string;    // url to cve.org record
  githubLink?: string;    // url to Github raw json
  dateUpdated?: string;   // ISO string

  static fromCveCorePlus(cvep: CveCorePlus): DeltaOutpuItem {
    let deltaItem = new DeltaOutpuItem();
    const cveid = cvep.cveId.toString();
    deltaItem.cveId = cveid;
    deltaItem.cveOrgLink = `${DeltaOutpuItem._cveOrgPrefix}${cveid}`;
    deltaItem.githubLink = `${DeltaOutpuItem._githubRawJsonPrefix}${CveId.getCveDir(cveid)}/${cveid}.json`;
    deltaItem.dateUpdated = cvep.dateUpdated;
    return deltaItem;
  }

  static replacer(key: string, value: any) {
    let items = [];
    if (key === 'new' || key === 'updated' || key === 'unknown') {
      value.forEach((item: CveCorePlus) => {
        // Note, it is important to keep this loop as simple as possible,
        //  don't rely on item being an actual CveCorePlus object since
        //  it may not be depending on what built it
        // console.log(`replacer item=${JSON.stringify(item, null, 2)}`);
        const cveid = item.cveId.toString();
        if (cveid) {
          items.push({
            cveId: cveid,
            cveOrgLink: `${DeltaOutpuItem._cveOrgPrefix}${cveid}`,
            githubLink: `${DeltaOutpuItem._githubRawJsonPrefix}${CveId.getCveDir(cveid)}/${cveid}.json`,
            dateUpdated: item.dateUpdated
          });
        }
      });
      return items;
    }
    else {
      return value;
    }
  }

  toJSON() {
    return {
      cveId: this.cveId,
      cveOrgLink: this.cveOrgLink,
      githubLink: this.githubLink,
      dateUpdated: this.dateUpdated
    };
  }


}


export class Delta {

  fetchTime?: string;
  // durationInMsecs?: number;   // if not set, it means that it was not calculated
  numberOfChanges: number = 0;
  new: CveCorePlus[] = [];
  updated: CveCorePlus[] = [];
  unknown?: CveCorePlus[] = []; // for any CVE that is not new or updated, which should never be the case except for errors

  // ----- constructor and factory functions ----- ----- 

  /** constructor
   *  @param prevDelta a previous delta to intialize this object, essentially prepending new
   *                   deltas to the privous ones (default is none)
   */
  constructor(prevDelta: Partial<Delta> = null) {

    // update with previous delta, if any
    if (prevDelta) {
      this.fetchTime = prevDelta?.fetchTime;
      // this.durationInMsecs = prevDelta?.durationInMsecs
      this.numberOfChanges = prevDelta?.numberOfChanges ?? 0;
      this.new = prevDelta?.new ? cloneDeep(prevDelta.new) : [];
      // this.published = prevDelta?.published ? cloneDeep(prevDelta.published) : [];
      this.updated = prevDelta?.updated ? cloneDeep(prevDelta.updated) : [];
      this.unknown = prevDelta?.unknown ? cloneDeep(prevDelta.unknown) : [];
    }
  }

  /**
   * Factory that generates a new Delta from git log based on a time window
   * @param start git log start time window
   * @param stop git log stop time window (defaults to now)
   */
  static async newDeltaFromGitHistory(start: string, stop: string = null, repository: string = null): Promise<Delta> {
    stop = (stop) ? stop : new Date().toISOString();
    const localDir = repository ? repository : process.env.CVES_BASE_DIRECTORY;
    console.log(`building new delta of ${localDir} from ${start} to ${stop}`);
    const git = new Git({ localDir });
    const delta = await git.logDeltasInTimeWindow(start, stop);
    // files.forEach(element => {
    //   const tuple = Delta.getCveIdMetaData(element);
    //   delta.add(new CveCore(tuple[0]), DeltaQueue.kUnknown);
    // });
    return delta;
  }

  /**
   * updates data in new and updated lists using CVE ID
   */
  hydrate() {
    this.new.forEach(item => item.updateFromLocalRepository());
    this.updated.forEach(item => item.updateFromLocalRepository());
  }


  // ----- static functions ----- ----- 

  /** returns useful metadata given a repository filespec:
   *   - its CVE ID (for example, CVE-1970-0001)
   *   - its partial path in the repository (for example, ./abc/def/CVE-1970-0001)
   *  @param path a full or partial filespec (for example, ./abc/def/CVE-1970-0001.json)
   *  @todo should be in a separate CveId or CveRecord class
   */
  static getCveIdMetaData(path: string): [string | undefined, string | undefined] {
    try {
      const cveId = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
      const cveIdPath = `${CveId.toCvePath(cveId)}`;
      return [cveId, cveIdPath];
    }
    catch (ex) {
      // not a CVE, ignore and just return
      return [undefined, undefined];
    }
  }


  /** calculates the delta filtering using the specified directory
   *  @param prevDelta the previous delta
   *  @param dir directory to filter (note that this cannot have `./` or `../` since this is only doing a simple string match)
   */
  static async calculateDelta(prevDelta: Partial<Delta>, dir: string): Promise<Delta> {
    // console.log(`calcuating delta in dir=${dir}`);
    const delta = new Delta(prevDelta);

    const git: SimpleGit = simpleGit('./', { binary: 'git' });
    const status: StatusResult = await git.status();
    // console.log(`status = ${JSON.stringify(status, null, 2)}`);

    const notAddedList = status.not_added.filter(item => item.startsWith(dir));
    const modifiedList = status.modified.filter(item => item.startsWith(dir));

    notAddedList.forEach(item => {
      const cveId = Delta.getCveIdMetaData(item)[0];
      if (cveId) {
        delta.add(new CveCorePlus(cveId), DeltaQueue.kNew);
      }
    });
    modifiedList.forEach(item => {
      const cveId = Delta.getCveIdMetaData(item)[0];
      if (cveId) {
        delta.add(new CveCorePlus(cveId), DeltaQueue.kUpdated);
      }
    });

    // console.log(`delta = ${JSON.stringify(delta, null, 2)}`);
    return delta;
  }

  // ----- private functions ----- -----

  /**
   * pure function:  given origQueue, this will either add cve if it is not already in origQueue
   * or replace the original in origQueue with cve
   * @param cve the CVE to be added/replaced
   * @param origQueue the original queue
   * @returns a typle:  
   *    [0] is the new queue (with the CVE either added or replace older)
   *    [1] either 0 if CVE is replaced, or 1 if new, intended to be += to this.numberOfChanges (deprecated)
   */
  private _addOrReplace(cve: CveCorePlus, origQueue: CveCorePlus[]): [CveCorePlus[], 0 | 1] {
    const i = origQueue.findIndex(item => item.cveId?.toString() == cve.cveId?.toString())
    if (i < 0) {
      return [[...origQueue, cve], 1];
    }
    else {
      // otherwise remove the original and add the new since it is more updated
      const newQueue = [...origQueue];
      newQueue[i] = cve;
      return [newQueue, 0];
    }
  }

  // ----- member functions ----- -----

  /** calculates the numberOfChanges property
   * @returns the total number of deltas in all the queues
   */
  calculateNumDelta(): number {
    return this.new.length
      // + this.published.length
      + this.updated.length
      + this.unknown.length;
  }

  /** adds a cveCore object into one of the queues in a delta object
   *  @param cve a CveCore object to be added
   *  @param queue the DeltaQueue enum specifying which queue to add to
   */
  add(cve: CveCorePlus, queue: DeltaQueue) {
    let tuple: [CveCorePlus[], 0 | 1];
    switch (queue) {
      case DeltaQueue.kNew:
        tuple = this._addOrReplace(cve, this.new);
        // this.numberOfChanges += tuple[1];
        this.new = tuple[0];
        break;
      // case DeltaQueue.kPublished:
      //   tuple = this._addOrReplace(cve, this.published);
      //   this.published = tuple[0];
      //   break;
      case DeltaQueue.kUpdated:
        tuple = this._addOrReplace(cve, this.updated);
        this.updated = tuple[0];
        break;
      default:
        if (cve.cveId) {
          console.log(`pushing into unknown:  ${JSON.stringify(cve)}`);
          this.unknown.push(cve);
        }
        else {
          console.log(`ignoring cve=${JSON.stringify(cve)}`);
        }
        break;
    }
    this.numberOfChanges = this.calculateNumDelta();
  }

  /** summarize the information in this Delta object in human-readable form */
  toText(): string {
    const newCves: string[] = [];
    this.new.forEach(item => newCves.push(item.cveId.id));
    const updatedCves: string[] = [];
    this.updated.forEach(item => updatedCves.push(item.cveId.id));
    const unkownFiles: string[] = [];
    this.unknown.forEach(item => unkownFiles.push(item.cveId.id));
    let s = `${this.new.length} new | ${this.updated.length} updated`;
    if (this.unknown.length > 0) {
      s += ` | ${this.unknown.length} other files`;
    }
    const retstr =
      `${this.numberOfChanges} changes (${s}):
      - ${this.new.length} new CVEs:  ${newCves.join(', ')}
      - ${this.updated.length} updated CVEs: ${updatedCves.join(', ')}
      ${this.unknown.length > 0 ? `- ${this.unknown.length} other files: ${unkownFiles.join(', ')}` : ``}
    `;
    return retstr;
  }

  // ----- I/O ----- -----

  /** writes the delta to a JSON file
   *  @param relFilepath relative path from current directory
  */
  writeFile(relFilepath: string = null): void {
    relFilepath = relFilepath ? relFilepath : `${process.env.CVES_BASE_DIRECTORY}/delta.json`;
    // console.log(`relFilepath=${relFilepath}`);
    const dirname = path.dirname(relFilepath);
    fs.mkdirSync(dirname, { recursive: true });
    if (!this.fetchTime) {
      this.fetchTime = new Date().toISOString();
    }
    const outputJson =
      fs.writeFileSync(`${relFilepath}`, JSON.stringify(
        this,
        DeltaOutpuItem.replacer,
        2));
    console.log(`delta file written to ${relFilepath}`);
  }


  /**
   * Copies delta CVEs to a specified directory, and optionally zip the resulting directory
   * @param relDir optional relative path from current directory to write the delta CVEs, default is `deltas` directory
   * @param zipFile optional relative path from the current directory to write the zip file, default is NOT to write to zip
   */
  writeCves(relDir: string | undefined = undefined, zipFile: string | undefined = undefined): void {
    const pwd = process.cwd();
    relDir = relDir ? relDir : `${pwd}/deltas`;
    fs.mkdirSync(relDir, { recursive: true });
    console.log(`copying changed CVEs to ${relDir}`);
    this.new.forEach(item => {
      const cveid = new CveId(item.cveId);
      const cvePath = cveid.getFullCvePath();
      console.log(`  ${item.cveId.id} (new)`);
      fs.copyFileSync(`${cvePath}.json`, `${relDir}/${item.cveId.id}.json`);
    });
    this.updated.forEach(item => {
      const cveid = new CveId(item.cveId);
      const cvePath = cveid.getFullCvePath();
      console.log(`  ${item.cveId.id} (updated)`);
      fs.copyFileSync(`${cvePath}.json`, `${relDir}/${item.cveId.id}.json`);
    });
    console.log(`${this.numberOfChanges} CVEs copied to ${relDir}`);

    if (zipFile) {
      const listing = FsUtils.ls(relDir);
      FsUtils.generateZipfile(listing, zipFile, "deltaCves", relDir);
      console.log(`zip file generated as ${relDir}/${zipFile}`);
    }
  }

  writeTextFile(relFilepath: string = null): void {
    relFilepath = relFilepath ? relFilepath : 'delta.md';
    let text = this.toText();
    if (text.length === 0) {
      text = "no files were changed";
    }
    fs.writeFileSync(relFilepath, text);
  }

}