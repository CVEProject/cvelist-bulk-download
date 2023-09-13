import * as dotenv from 'dotenv';
import { differenceInCalendarDays, parse } from 'date-fns';

import { CveDate } from './CveDate.js';

dotenv.config();

describe(`CveDate`, () => {

  it(`constructor should create a new CveDate from a valid date string representation`, async () => {
    const timestring = "2023-08-09T20:01:02.123Z"
    const cveDate = new CveDate(timestring);
    expect(cveDate.asIsoDateString().toString()).toMatch(CveDate.toISOString(cveDate.asDate()));
  });

  it(`default constructor should create a new CveDate from the current time`, async () => {
    const timestamp = new Date();
    const cveDate = new CveDate();
    expect(cveDate.asIsoDateString().toString()).toMatch(CveDate.toISOString(timestamp));
  });

  it(`asDateString() should return a properly formatted string`, async () => {
    const cveDate = new CveDate("2023-04-01T20:06:07.890Z");
    // console.log(`cveDate.asDateString() --> ${cveDate.asDateString()}`);
    expect(cveDate.asDateString()).toContain(`2023-04-01 4:06:07 PM Eastern Daylight Time`);
  });


  // ----- static class utilities ----- ----- ----- ----- ----- 


  it(`toISOString() should output its ISO date string representation`, async () => {
    const timestamp = new Date();
    const iso = CveDate.toISOString(timestamp);
    expect(iso).toMatch(timestamp.toISOString());
  });


  it(`getDateComponents() should outut a tuple of the components of a date`, async () => {
    const timestamp = new Date();
    let iso = CveDate.toISOString(timestamp);
    let tuple = CveDate.getDateComponents(timestamp);
    // console.log(`tuple=${JSON.stringify(tuple, null, 2)}`);
    expect(tuple[0]).toMatch(iso.substring(0, iso.indexOf('T')));
    expect(tuple[1]).toMatch(iso.substring(iso.indexOf('T') + 1));
    expect(tuple[2]).toMatch(iso.substring(iso.indexOf('T') + 1, iso.indexOf(':')));
    
    tuple = CveDate.getDateComponents();
    expect(tuple[0]).toMatch(iso.substring(0, iso.indexOf('T')));

    let dateStr = "2023-08-01T03:09:37.966Z"
    let date = new CveDate(dateStr)
    tuple = CveDate.getDateComponents();
    expect(tuple[0]).toMatch(iso.substring(0, iso.indexOf('T')));
  });


  it(`getMidnight() should output midnight of today`, async () => {
    const midnightISO = CveDate.toISOString(CveDate.getMidnight());
    const todayIso = CveDate.toISOString();
    expect(midnightISO.substring(0, midnightISO.indexOf('T'))).toMatch(todayIso.substring(0, todayIso.indexOf('T')));
    expect(midnightISO).toContain('00:00:00.000Z');
  });

  it(`getMidnightYesterday() should output midnight of yesterday`, async () => {
    const midnight = CveDate.getMidnight()
    const midnightYesterday = CveDate.getMidnightYesterday()
    expect(differenceInCalendarDays(midnight,midnightYesterday)).toBe(1)
  });

  // it(`getYesterday() should output yesterday's date as a string`, async () => {
  //   const now = new Date();
  //   const yesterday = CveDate.getYesterday();
  //   const yesterdate = parse(yesterday, 'yyyy-MM-dd', new Date());
  //   expect(differenceInCalendarDays(now, yesterdate)).toBe(1);
  // });

});