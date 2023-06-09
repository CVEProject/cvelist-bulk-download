/**
 *  ActivityLog - log of activities
 *  Intent is to log everything that makes changes to the repository, so key information is stored from 
 *  GitHub action to GitHub action (e.g., stopdate of last activity for re-running a command)
 */

import fs from 'fs';
import path from 'path';

import { Activity } from './Activity.js';

export interface ActivityLogOptions {
  path?: string,
  filename?: string,
  // mode?: "prepend" | "append";
  logCurrentActivity?: boolean;
  logAlways?: boolean;
  logKeepPrevious?: boolean;
}

export class ActivityLog {

  _options: ActivityLogOptions;
  _fullpath: string;
  _activities: Activity[] = [];

  constructor(options: ActivityLogOptions) {
    this._options = options;
    this._options.path = options.path || `.`;
    this._options.filename = options.filename || `./test/activities_recent.json`;
    // this._options.mode = options.mode || `prepend`;
    this._options.logAlways = options.logAlways || false;
    this._options.logKeepPrevious = options.logKeepPrevious || false;
    this._fullpath = `${this._options.path}/${this._options.filename}`;

    // console.log(`ActivityLog constructor:  options=${JSON.stringify(this)}`)
    // console.log(`options=`, this._options);
    if (this._options.logKeepPrevious) {
      this._activities = ActivityLog.readFile(this._fullpath);
    }
    else {
      // fs.unlinkSync(this._fullpath);
      this.clearActivities();
    }

  }


  // clears the file
  clearActivities(): void {
    this._activities = [];
  }



  /**
   * @returns the most recent activity object
   */
  getMostRecentActivity(): Activity {
    return this._activities[0];
  }


  /**
   * prepends activity to activities
   * @param activity the activity object to prepend
   * @returns the current list of activities, after prepending
   */
  prepend(activity: Activity): Activity[] {
    // console.log(`options=`, this._options);
    if (this._options.logAlways || activity?.steps.length > 0) {
      this._activities.unshift(activity);
    }
    return this._activities;
  }

  // ----- IO ----- ----- ----- ----- ----- ----- ----- ----- ----- -----

  /** writes activities to a file
    * @return true iff the file was written
    */
  writeRecentFile(): boolean {
    // console.log(`options=`, this._options);
    if (this._options.logAlways || this._activities.length > 0) {
      ActivityLog.writeFile(this._fullpath, JSON.stringify(this._activities, null, 2));
      return true;
    }
    return false;
  }



  // ----- static functions ----- ----- ----- ----- ----- ----- ----- ----- ----- 


  /** reads in the recent activities into _activities */
  static readFile(relFilepath: string): Activity[] {
    let json = [];
    if (fs.existsSync(relFilepath)) {
      const str = fs.readFileSync(relFilepath, { encoding: 'utf8', flag: 'r' });
      if (str.length > 0) {
        json = JSON.parse(str);
      }
    }
    return json;
  }

  /** writes to activity file */
  static writeFile(relFilepath: string, body: string): void {
    const dirname = path.dirname(relFilepath);
    fs.mkdirSync(dirname, { recursive: true });
    fs.writeFileSync(`${relFilepath}`, body);
  }

}