/**
 *  Activity object
 *  This is the activity object in an ActivityLog file
 */
import { isEqual, cloneDeep } from 'lodash';

import { CveDate } from './CveDate.js';
import { Delta } from '../core/Delta.js';


export interface ActivityError {
  [key: string]: string;
}


export interface ActivityNotes {
  [key: string]: string;
}

export enum ActivityStatus {
  Unknown = "unknown",
  NoStarted = "not_started",
  InProgress = "in_progress",
  Completed = "completed",
  Failed = "failed"
}

export interface ActivityProps {
  // all dates and times are ISO format
  startTime: string,
  stopTime: string,
  duration: string,
  // type: `github` | `manual`,
  name: string,
  url?: string, // optional URL to github action, none for manual
  status: ActivityStatus,
  errors?: ActivityError[],
  notes?: ActivityNotes;
  delta?: Delta,
  steps?: ActivityStep[];
}

export interface ActivityStep {
  stepDescription: string;
  startTime: string;  // start of step
  stopTime: string;   // end of step
  duration: string;   // duration of step
  summary: {
    startWindow?: string;  // actual start window (used by getCvesInWindow, getCvesInFirstFrame)
    endWindow?: string;    // actual end window (used by getCvesInWindow, getCvesInFirstFrame)
    page?: number;         // page number (used by getCvesByPage)
    count: number;         // number of CVE records
    cveIds?: string[];     // CVE IDs involved with this particular iteration (startWindow to endWindow or page)
    // Note that cveIds does not take into account if a previous frames returned
    // the same set of CVE IDs, only that the current frame returned this set
    // If you want to see the deltas, see ActivityAction, which shows overall new and updated CVEs
    // regardless of which frame/operation it happened in
  };
}

export class Activity implements ActivityProps {

  startTime: string = CveDate.toISOString();
  stopTime: string = "?";
  duration: string = "?";
  // type: `github` | `manual`,
  name: string = "?";
  url?: string = "?"; // optional URL to github action, none for manual
  status: ActivityStatus;
  errors?: ActivityError[];
  notes?: ActivityNotes;
  delta?: Delta;
  steps: ActivityStep[];

  constructor(props: ActivityProps = null) {
    // set defaults first

    // update with props
    if (props) {
      this.startTime = props?.startTime;
      this.stopTime = props?.stopTime;
      this.duration = props?.duration;
      this.name = props?.name;
      this.url = props?.url;
      this.status = props?.status;
      this.errors = props?.errors ? cloneDeep(props.errors) : [];
      this.notes = props?.notes ? cloneDeep(props.notes) : {};
      this.delta = props?.delta ? cloneDeep(props.delta) : { newCves: [], updatedCves: [] };
      this.steps = props?.steps ? cloneDeep(props.steps) : [];
    }
  }

  equalTo(props: ActivityProps): boolean {
    return isEqual(this, props);
  }


  // prepends a step to steps
  prependStep(step: ActivityStep): ActivityStep[] {
    if (step?.summary?.count > 0) {
      this.steps.unshift(step);
    }
    return this.steps;
  }

}