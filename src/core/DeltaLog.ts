/**
 *  DeltaLog - log of current and recent historical deltas
 *  Intent is to log all deltas from the current delta to recent historical deltas,
 *  so key information is stored, and other systems using deltas as polling integration points
 *  can poll at almost arbitrary frequency
 * 
 *  The deltas in the DeltaLog is intended to provide most of the useful information
 *  about a CVE, so that
 *    1. the data can be used as a filter
 *    2. minimize REST calls to CVE REST Services
 */

import fs from 'fs';
import path from 'path';

import { Delta, DeltaOutpuItem } from './Delta.js';
import { IsoDateString } from '../common/IsoDateString.js';

// export interface DeltaLogOptions {
//   path?: string,
//   filename?: string,
//   // mode?: "prepend" | "append";
//   logCurrentActivity?: boolean;
//   logAlways?: boolean;
//   logKeepPrevious?: boolean;
// }

export class DeltaLog extends Array<Delta>{

  static kDeltaLogFilename = `deltaLog.json`;
  static kDeltaLogFile = `cves/${DeltaLog.kDeltaLogFilename}`;
  // _options: DeltaLogOptions;
  // _fullpath: string =
  // _deltas: Delta[] = [];

  // ----- constructor and factory functions ----- ----- ----- ----- ----- ----- ----- ----- ----- 

  constructor(/* options: DeltaLogOptions */) {
    super();
    // this._options = options;
    // this._options.path = options.path || `.`;
    // this._options.filename = options.filename || `./test/activities_recent.json`;
    // // this._options.mode = options.mode || `prepend`;
    // this._options.logAlways = options.logAlways || false;
    // this._options.logKeepPrevious = options.logKeepPrevious || false;
    // this._fullpath = `${this._options.path}/${this._options.filename}`;

    // console.log(`DeltaLog constructor:  options=${JSON.stringify(this)}`)
    // console.log(`options=`, this._options);
    // if (this._options.logKeepPrevious) {
    // this._deltas = DeltaLog.readFile(this._fullpath);
    // }
    // else {
    //   // fs.unlinkSync(this._fullpath);
    //   this.clearActivities();
    // }
  }

  /** constructs a DeltaLog by reading in the deltaLog file 
   *  @param pruneOlderThan optional ISO date, any items older than that date will
   *    not be included in the resulting DeltaLog
   *  @param relFilepath optional path to the logfile (defaults to cves/deltaLog.json)
   *  
  */
  static fromLogFile(
    relFilepath?: string,
    pruneOlderThan?: IsoDateString,
  ): DeltaLog {
    if (!pruneOlderThan) {
      const days = process.env.CVES_DEFAULT_DELTA_LOG_HISTORY_IN_DAYS ?? "30";
      pruneOlderThan = new IsoDateString().daysAgo(parseInt(days));
      console.log(`setting pruning date to ${pruneOlderThan}`);
    }
    if (!relFilepath) {
      console.log(`setting logFile to ${DeltaLog.kDeltaLogFile}`);
      relFilepath = DeltaLog.kDeltaLogFile;
    }
    const pruneOlderThanTicks = pruneOlderThan.toNumber()
    let json = [];
    if (fs.existsSync(relFilepath)) {
      const str = fs.readFileSync(relFilepath, { encoding: 'utf8', flag: 'r' });
      if (str.length > 0) {
        json = JSON.parse(str);
      }
    }
    let log = new DeltaLog();
    json.forEach(ele => {
      const fetchTime = new IsoDateString(ele['fetchTime']);
      if (fetchTime.toNumber() >= pruneOlderThanTicks) {
        log.push(new Delta(ele));
      }
    });

    return log;
  }


  // ----- class functions ----- ----- ----- ----- ----- ----- ----- ----- ----- 

  /**
   * prepends a delta to log
   * @param delta the Delta object to prepend
   */
  prepend(delta: Delta): void {
    this.unshift(delta);
  }

  /** sorts the Deltas in place by date 
   *  @param direction: "latestFirst" | "latestLast"
  */
  sortByFetchTme(direction: "latestFirst" | "latestLast"): DeltaLog {
    return this.sort((a, b) => {
      const d1 = a.fetchTime ? new Date(a.fetchTime) : new Date();
      const d2 = b.fetchTime ? new Date(b.fetchTime) : new Date();
      if (direction === 'latestFirst') {
        return d2.getTime() - d1.getTime();
      }
      else {
        return d1.getTime() - d2.getTime();
      }
    });
  }

  // ----- IO ----- ----- ----- ----- ----- ----- ----- ----- ----- -----

  /** writes deltas to a file
   *  @param relFilepath optional relative or full filepath
   *  @returns true iff the file was written (which only happens when 
   *    there the [0] delta has changes)
    */
  writeFile(relFilepath?: string): boolean {
    if (this.length === 0 || this[0].numberOfChanges === 0) {
      return false;
    }
    else {
      if (!relFilepath) {
        relFilepath = DeltaLog.kDeltaLogFile;
      }
      const dirname = path.dirname(relFilepath);
      fs.mkdirSync(dirname, { recursive: true });
      fs.writeFileSync(`${relFilepath}`, JSON.stringify(this, DeltaOutpuItem.replacer, 2));
      return true;
    }
  }

}