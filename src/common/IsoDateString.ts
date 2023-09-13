/** Class representing a strongly opinionated ISO Date+Time+TZ string with utils
 *  Note that this class was written to be very opinionated. See IsoDateString.test.ts for properly formatted
 *    and improperly formatted strings.  In general, the output of Date.toISOString() is
 *    the preferred format, with some exceptions as noted in IsoDateString.test.ts
 *
 *  Note that in the future, if necessary, we can extend what this class covers, but for now
 *    this strict and opinionated set is very useful for processing ISO Date+Time+TZ strings
 */

/** a regular expression to represent an ISO Date+Time+TZ string
 *  taken from https://stackoverflow.com/a/3143231/1274852
 *  works for cases used in CVE representations
 */
import add from 'date-fns/add';
export const IsoDateStringRegEx =
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

export class IsoDateString {
  _isoDateString: string = '';
  _date: Date;

  /** returns a IsoDateString object iff isoDateStr is a properly formatted ISO Date+Time+TZ string,
   *  or if a string is not specified, then this will create a IsoDateString of "now" using new Date()
   *  Note that the constructor will always create a new IsoDateString containing a valid value, or it will throw an exception
   *  @param isoDateStr a properly formatted ISO Date+Time+TZ string (defaults to now)
   *  @param assumeZ set to true if want to assume a trailing Z for GMT/Zulu time zone (default is false)
   *                 this is needed because CVEs timestamps may be missing the timezone, and we are assuming it to be GMT
   */
  constructor(isoDateStr: string = null, assumeZ = false) {
    if (!isoDateStr) {
      isoDateStr = new Date().toISOString();
    }
    if (isoDateStr[isoDateStr.length - 1] !== 'Z' && assumeZ) {
      isoDateStr = `${isoDateStr}Z`;
    }
    if (IsoDateString.isIsoDateString(isoDateStr)) {
      this._isoDateString = isoDateStr;
      this._date = new Date(Date.parse(this._isoDateString));
    } else {
      throw new TypeError(`Invalid ISO Date string:  ${isoDateStr}`);
    }
  }

  /**
   * builds an IsoDateString using a Javascript Date object
   * @param date a JavaScript Date object
   * @returns an IsoDateString
   */
  static fromDate(date: Date): IsoDateString {
    return new IsoDateString(date.toISOString());
  }

  /**
   * builds an IsoDateString using the number of seconds since 1/1/1970
   * @param secsSince1970 number representing seconds since 1/1/1970
   * @returns an IsoDateString
   */
  static fromNumber(secsSince1970: number): IsoDateString {
    return IsoDateString.fromDate(new Date(secsSince1970));
  }

  static fromIsoDateString(isoDateStr: IsoDateString): IsoDateString {
    const iso = new IsoDateString(isoDateStr.toString());
    return iso;
  }

  /** returns the number of characters in the string representation */
  length(): number {
    return this._isoDateString.length;
  }

  /** returns the string representation */
  toString(): string {
    return this._isoDateString;
  }


  /**
   * @returns a number representing the number of millisecs since 1970-01-01T00:00:00.000Z
   */
  toNumber(): number {
    return this._date.getTime();
  }


  /** properly outputs the object in JSON.stringify() */
  toJSON(): string {
    return this.toString();
  }

  /** returns a JS Date object from the string representation */
  toDate(): Date {
    return this._date;
  }

  // ----- static ----- ----- -----

  /** strict testing of a string for being a valid ISO Date+Time+TZ string  */
  static isIsoDateString(str: string): boolean {
    return IsoDateStringRegEx.test(str);
  }

  /**
   * return a new IsoDateString that is minutes ago or since
   * @param minutes positive number to minutes ago, negative number for minutes since
   * @returns a new IsoDateString that is specified minutes ago or since
   */
  minutesAgo(minutes: number | string): IsoDateString {
    if (typeof minutes === 'string') {
      minutes = parseInt(minutes);
    }
    const timeStamp = add(this._date, { minutes: -minutes });
    return new IsoDateString(timeStamp.toISOString());
  }

  /**
   * return a new IsoDateString that is hours ago or since
   * @param hours positive number to hours ago, negative number for hours since
   * @returns a new IsoDateString that is specified hours ago or since
   */
  hoursAgo(hours: number | string): IsoDateString {
    if (typeof hours === 'string') {
      hours = parseInt(hours);
    }
    const timeStamp = add(this._date, { hours: -hours });
    return new IsoDateString(timeStamp.toISOString());
  }

  /**
   * return a new IsoDateString that is days ago or since
   * @param days positive number to days ago, negative number for days since
   * @returns a new IsoDateString that is specified days ago or since
   */
  daysAgo(days: number | string): IsoDateString {
    if (typeof days === 'string') {
      days = parseInt(days);
    }
    const timeStamp = add(this._date, { days: -days });
    return new IsoDateString(timeStamp.toISOString());
  }
}