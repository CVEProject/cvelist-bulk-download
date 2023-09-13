/**
 *  Date utility and class to 
 *    - facilitate using dates in CveRecords and Javascript, standardizing all dates to 
 *      ISO format:  2023-03-29T00:00:00.000Z
 *    - provide timer functions inside instances 
 * 
 *  This is necessary because the Javascript Date object, while tracking UTC time 
 *  internally (that is, the number of milliseconds since 1970-01-01T00:00:00.000Z)
 *  does not provide many functions to work with that time zone, choosing local time zone
 *  in most cases.  The exceptions are new Date("<UTC timestamp>") and toISOString().
 * 
 *  This class provides additional functions to meet the needs of this project.
 * 
 *  In most cases in this project, since we deal with ISO dates almost exclusively, 
 *  we are moving to common/IsoDateString.
 * 
 *  Throughout this class, we will use
 *    - jsDate to represent a standard JS Date object
 *    - isoDateStr to represent an ISO/UTC/Z date string (e.g. 2023-03-29T00:00:00.000Z)
 */


import {
  differenceInSeconds,
  // endOfYesterday,
  // startOfToday,
  // startOfYesterday,
  sub
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { IsoDateString } from '../common/IsoDateString.js';

export class CveDate {

  /** the Date object this CveDate instance wraps */
  private _jsDate: Date;

  /** the constructor only creates a new CveDate based on an ISO date string 
   *  @param isoDateStr a string represenation of a date in ISO/UTC/Z format
   *                    defaults to "now"
  */
  constructor(isoDateStr?: IsoDateString | string) {
    let isoDate: IsoDateString;
    if (isoDateStr instanceof IsoDateString) {
      isoDate = isoDateStr;
    }
    else {  // isoDateStr is a string
      isoDate = new IsoDateString(isoDateStr);
    }
    this._jsDate = new Date(isoDate.toString());
  }

  /** returns this as an ISO/UTC/Z date string */
  asIsoDateString(): IsoDateString {
    return new IsoDateString(CveDate.toISOString(this.asDate()));
  }

  /** returns a ISO/UTC formatted string in specified locale and time zone */
  asDateString(timeZone: string = "America/New_York"): string {
    return formatInTimeZone(this.asDate(), timeZone, "yyyy-MM-dd pp zzzz");
  }

  /** returns as a JS Date object */
  asDate(): Date {
    return this._jsDate
  }

  /** returns JS Date.toISOString() */
  toString(): string {
    return CveDate.toISOString(this.asDate());
  }

  // ----- static class utilities ----- ----- ----- ----- -----

  /**
   * @param jsDate a JS Date object, defaults to current timestamp
   * @returns the current date in ISO string format (i.e., JS Date's toISOString() format)
   */
  static toISOString(jsDate: Date = null): string {
    const time = jsDate ? jsDate : new Date();
    return time.toISOString();
  }

  /**
   * gets several date and time portions of a Date object as a tuple, defaults to current timestamp
   * @param jsDate a JS Date object, defaults to current timestamp
   * @returns a tuple of strings representing the components of jsDate
   *  [0] - the date (e.g. "2023-03-29")
   *  [1] - the time (e.g., "19:05:55.559Z")
   *  [2] - the hour (e.g., "19")
   */
  static getDateComponents(jsDate?: Date): string[] {
    const isoStr = (jsDate) ? jsDate.toISOString() : new Date().toISOString()
    return [
      isoStr.substring(0, isoStr.indexOf('T')), // [0] see comment above
      isoStr.substring(isoStr.indexOf('T') + 1), // [1] see comment above
      isoStr.substring(isoStr.indexOf('T') + 1, isoStr.indexOf(':')), // [2] see comment above
    ];
  }

  /**
   * returns today's midnight (i.e., today's date with hours all set to 0)
   * @returns today's midnight as a Javascript Date object
   */
  static getMidnight(): Date {
    const midnight = new Date();
    midnight.setUTCHours(0, 0, 0, 0);
    return midnight;
  }

  /**
   * returns yesterday's midnight (i.e., yesterday's date with hours all set to 0)
   * @returns yesterday's midnight as a Javascript Date object
   */
  static getMidnightYesterday(): Date {
    const midnight = CveDate.getMidnight();
    const midnightYesterday = sub(midnight, { hours: 24 });
    return midnightYesterday;
  }

  /**
   * returns yesterday's date as a string
   * @returns yesterday's date as a string
   */
  static getYesterday(): string {
    const midnightYesterday = CveDate.getMidnightYesterday();
    return CveDate.getDateComponents(midnightYesterday)[0];
  }

  /**
   * returns yesterday's midnight (i.e., yesterday's date with hours all set to 0)
   * @returns yesterday's midnight as a Javascript Date object
   */
  static getSecondsAfterMidnight(): number {
    const now = new CveDate();
    const midnight = CveDate.getMidnight();
    return differenceInSeconds(now.asDate(), midnight);
  }
}