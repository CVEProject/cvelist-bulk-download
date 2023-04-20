/**
 * Updates /cves by dates using CveService
 */

import {
  add,
  differenceInSeconds,
  parseISO
} from 'date-fns';

import { Activity, ActivityStatus, ActivityStep } from '../core/Activity.js';
import { ActivityLogOptions, ActivityLog } from '../core/ActivityLog.js';
import { CveRecord } from '../core/CveRecord.js';
import { CveService } from './CveService.js';
import { Delta } from '../core/Delta.js';

export const kActivity_UpdateByModificationDateWindow = 'UPDATE_BY_MODIFICATION_DATE_WINDOW';
export const kActivity_UpdateByPage = 'UPDATE_BY_PAGE';
export class CveUpdater {

  /** repository base path */
  _repository_base = `${process.env.CVES_BASE_DIRECTORY}`;
  _release_note_path = `${this._repository_base}/release_notes.md`;
  _recent_activities_path = `${this._repository_base}/${process.env.CVES_RECENT_ACTIVITIES_FILENAME}`;

  _activityLog: ActivityLog;

  constructor(activity: string, logOptions: ActivityLogOptions) {
    // console.log(`CveUpdater(options=${JSON.stringify(logOptions)})`)
    this._activityLog = new ActivityLog(logOptions);
  }

  // ----- CVE updates -----

  /** retrieves CVEs added or updated in a window of time 
   *  NOTE that if the number of records is > max, then the window is narrowed
   *  until the number of records is <= max, and only this narrowed window (called a frame) of CVEs
   *  is returned.  It is the responsibility of the caller to repeat
   *  the call (with new startWindow set to previous endWindow) until
   *  new startWindow is >= the original endWindow.  See tests for example.
   * 
   *  @param startWindow requested start window, MUST BE ISO
   *  @param endWindow requested end window, MUST BE ISO
   *  @param max max records requested (default is 500)
   *             if the number of records in [startWindow,endWindow] > max, then endWindow is shortened until 
   *             number of records < max
   *  @param writeDir a path to write CVE JSON objects to (defaults to undefined, which will not persist any CVEs, useful when trying to query statistics about CVEs)
   *  @returns an Activity with data and properties OR
   *           null if params are detected to be a no-op
   * 
   *  @todo NOTE that there is a known bug at present, where if there were > max records that were changed in less than 1 second
   *  this will go into an endless loop.
   *    Note that this has not happened in the last few weeks (hk on 4/5/23).  In the review, Thu suggested to add a sleep function, which I think may be 
   *    a good starting point to fix this problem
  */
  async getFirstCvesFrame(
    startWindow: string,
    endWindow: string,
    max: number = 500,
    writeDir: string | undefined = undefined
  ): Promise<ActivityStep | undefined> {
    if (startWindow == endWindow) {
      // no need to run
      return undefined;
    }
    const timestampStart = Date.now();
    const actualStartWindow = startWindow;
    let actualEndWindow = endWindow;
    const service = new CveService();
    let queryString = '';
    let totalCount = 0;
    let tries = 0;
    let diff = 0;
    const actualStartWindowIso = parseISO(actualStartWindow);
    do {
      queryString = `time_modified.gt=${actualStartWindow}&time_modified.lt=${actualEndWindow}`;
      const resp = await service.cve({ queryString: `count_only=1&${queryString}` });
      totalCount = parseInt(resp.totalCount);
      diff = differenceInSeconds(parseISO(actualEndWindow), actualStartWindowIso);
      console.log(`try=${tries}:  currentCount=${totalCount} / ${max}  (diff=${diff}: [${actualStartWindow},${actualEndWindow}])`);
      if (totalCount > max) {
        actualEndWindow = add(actualStartWindowIso, { seconds: diff / 2 }).toISOString();
      }
      tries++;
    } while (totalCount > max && diff > 0 && tries < 20);
    const cves = await service.cve({ queryString });
    const cveIds: string[] = [];
    cves.cveRecords.forEach(record => {
      cveIds.push(record.cveMetadata.cveId);
    });

    const startTime = new Date(timestampStart).toISOString();
    const timestampEnd = Date.now();
    const step = {
      startTime,
      stopTime: new Date(timestampEnd).toISOString(),
      duration: `${timestampEnd - timestampStart} msecs`,
      stepDescription: kActivity_UpdateByModificationDateWindow,
      summary: {
        startWindow: actualStartWindow,
        endWindow: actualEndWindow,
        count: cves.cveRecords.length,
        cveIds,
      }
    };

    // write file to repository
    if (writeDir) {
      cves.cveRecords.forEach(json => {
        const cve = new CveRecord(json);
        cve.writeToCvePath(writeDir);
      });
    }
    return step;
  }


  /** retrieves the CVEs in a window of time 
   *  @param startWindow requested start window, MUST BE ISO
   *  @param endWindow requested end window, MUST BE ISO
   *  @param max max records requested
   *             if the number of records in [startWindow,endWindow] > max, then endWindow is shortened until 
   *             number of records < max
   *  @returns an Activity with data and properties OR
   *           null if params are detected to be a no-op
  */
  async getCvesInWindow(
    startWindow: string,
    endWindow: string,
    max: number = 500,
    writeDir: string | undefined = undefined
  ): Promise<Activity> {
    const timestampStart = Date.now();

    // start an ActivityLog for the steps to be prepended into
    const startTime = new Date(timestampStart).toISOString();
    const activity: Activity = new Activity({
      startTime,
      stopTime: '',
      duration: '',
      name: `cves in window`,
      // url: `tbd`,
      status: ActivityStatus.Completed,
      // errors: [{ "tbd": "tbd" }],
      // notes: {
      //   // "function": "getCvesInWindow()",
      //   // "params": JSON.stringify({ startWindow, endWindow, max, writeDir }, null, 2)
      // },
      delta: undefined,
      steps: []
    });

    // do window
    let newStartWindow: string = startWindow;
    let newEndWindow = endWindow;
    let step: ActivityStep | undefined;
    do {
      step = await this.getFirstCvesFrame(newStartWindow, newEndWindow, max, `${process.env.CVES_BASE_DIRECTORY}`);
      if (step) {
        // count = activity.summary.count;
        const stepEndWindow = step?.summary?.endWindow;
        if (stepEndWindow) {
          newStartWindow = stepEndWindow;
        }
        activity.prependStep(step);
        // console.log(`getCvesInWindow.step.summary.count=${step.summary.count}`);
      }
    } while (step && newStartWindow < newEndWindow);


    // add remainder of Activity properties
    activity.delta = await Delta.calculateDelta({}, `${this._repository_base}`);
    // console.log(`activity after checking for delta:  ${JSON.stringify(activity, null, 2)}`);
    const timestampEnd = Date.now();
    activity.stopTime = new Date(timestampEnd).toISOString();
    activity.duration = `${timestampEnd - timestampStart} msecs`;
    return activity;
  }


  // ----- Recent Activities log -----


  /** reads recent activities data */
  readRecentActivities(): Activity[] {
    return this._activityLog._activities;
  }


  /** write recent activities to file */
  writeRecentActivities(): boolean {
    return this._activityLog.writeRecentFile();
  }

}