import * as dotenv from 'dotenv';
import { IsoDateStringRegEx, IsoDateString } from './IsoDateString.js';

dotenv.config();

describe(`IsoDateString`, () => {
  it(`constructor should construct a new object if param is properly formatted`, () => {
    expect(() => {
      new IsoDateString();
    }).not.toThrow(TypeError);
    expect(() => {
      new IsoDateString('2023-03-31T01:02:03.004Z');
    }).not.toThrow(TypeError);
    expect(() => {
      new IsoDateString('2023-03-31T01:02:03.004', true);
    }).not.toThrow(TypeError);
    expect(() => {
      new IsoDateString('2023-03-31T01:02:03Z');
    }).not.toThrow(TypeError);
    expect(() => {
      new IsoDateString('2023-03-31T01:02:03.004-04:00');
    }).not.toThrow(TypeError);
    expect(() => {
      new IsoDateString('2023-03-31T01:02:03.004-04:30');
    }).not.toThrow(TypeError);
  });

  it(`constructor can assume Z time zone if requested`, () => {
    const dateStr0 = `2023-03-31T01:02:03.004`;
    const dateStr1 = `2023-03-31T01:02:03.004Z`;
    expect(
      new IsoDateString(dateStr0, true).toString()
    ).toMatch(dateStr1);
    expect(
      new IsoDateString(dateStr1).toString()
    ).toMatch(dateStr1);
    expect(
      new IsoDateString(dateStr1, true).toString()
    ).toMatch(dateStr1);

    expect(() => {
      new IsoDateString(dateStr0, true);
    }).not.toThrow(TypeError);

    const str = new IsoDateString(null).toString();
    expect(str[str.length - 1]).toBe('Z');
  });


  it(`constructor builds a "now" date if no parameters are set`, () => {
    expect(() => {
      new IsoDateString(null, true);
    }).not.toThrow(TypeError);
  });

  it(`constructor misassuming Z time zone should work if the original timestamp is already in Z time zone`, () => {
    expect(() => {
      new IsoDateString('2023-03-31T01:02:03.004Z', true);
    }).not.toThrow(TypeError);
  });

  it(`constructor should result in a proper JS Date object`, () => {
    const iso = new IsoDateString('2023-03-31T01:02:03.004Z');
    const jsDate = iso.toDate();
    expect(jsDate.getFullYear()).toBe(2023);
    expect(jsDate.getMonth()).toBe(2); // month, zero based
    expect(jsDate.getDate()).toBe(30); // date of month, zero based
    expect(jsDate.getUTCHours()).toBe(1);
    expect(jsDate.getMinutes()).toBe(2);
    expect(jsDate.getSeconds()).toBe(3);
    expect(jsDate.getMilliseconds()).toBe(4);
  });

  it(`constructor throws TypeError if improper format`, () => {
    expect(() => {
      new IsoDateString('2023-03-31 01:02:03.004Z');
    }).toThrow(TypeError);
    expect(() => {
      new IsoDateString('2023-03-31T01:02:03.004');
    }).toThrow(TypeError);
    expect(() => {
      new IsoDateString('2023-03-31');
    }).toThrow(TypeError);
  });

  it(`fromDate() can create a new IsoDateString`, () => {
    const ticks1970 = 1682789845144;
    const date = new Date(ticks1970);
    expect(IsoDateString.fromDate(date)).toEqual(
      new IsoDateString(date.toISOString()),
    );
  });

  it(`fromNumber() can create a new IsoDateString`, () => {
    const ticks1970 = 1682789845144;
    const date = new Date(ticks1970);
    expect(IsoDateString.fromNumber(ticks1970)).toEqual(
      new IsoDateString(date.toISOString()),
    );
  });

  it(`fromIsoDateString() can build an IsoDateString from another IsoDateString`, () => {
    const isoDate1 = new IsoDateString('2023-03-31T01:02:03.004', true);
    const isoDate2 = IsoDateString.fromIsoDateString(isoDate1);
    expect(isoDate2._date).toEqual(isoDate1._date);
    expect(isoDate2._isoDateString).toMatch(isoDate1._isoDateString);
  });

  it(`length() correctly returns length of date string`, () => {
    let dateStr = '2023-03-31T01:02:03.004Z';
    let date = new IsoDateString(dateStr);
    expect(date.length()).toBe(dateStr.length);

    dateStr = '2023-03-31T01:02:03Z';
    date = new IsoDateString(dateStr);
    expect(date.length()).toBe(dateStr.length);
  });

  it(`toString() correctly returns the date string`, () => {
    let dateStr = '2023-03-31T01:02:03.004Z';
    let date = new IsoDateString(dateStr);
    expect(date.toString()).toBe(dateStr);

    dateStr = '2023-03-31T01:02:03Z';
    date = new IsoDateString(dateStr);
    expect(date.toString()).toBe(dateStr);
  });

  it(`toNumber() correctly returns the ISO date string as millisecs since 1970-01-01T00:00:00.000Z`, () => {
    const dateStr = '2023-03-31T01:02:03.004Z';
    const date = new IsoDateString(dateStr);
    expect(date.toNumber()).toBe(1680224523004);
  });

  it(`toDate() correctly returns the date`, () => {
    let dateStr = '2023-03-31T01:02:03.004Z';
    let jsDate = new Date(dateStr);
    let date = new IsoDateString(dateStr);
    expect(date.toDate()).toEqual(jsDate);
    expect(date.toString()).toBe(jsDate.toISOString());

    dateStr = '2023-03-31T01:02:03Z';
    jsDate = new Date(dateStr);
    date = new IsoDateString(dateStr);
    expect(date.toDate()).toEqual(jsDate);
    expect(date.toDate().toISOString()).toBe(jsDate.toISOString());
  });

  // ----- static functions ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----

  it(`isIsoDateString() should return true for properly formatted ISO date strings`, () => {
    expect(
      IsoDateString.isIsoDateString('2023-03-31T01:02:03.004Z'),
    ).toBeTruthy();
    expect(IsoDateString.isIsoDateString('2023-03-31T01:02:03Z')).toBeTruthy();
    expect(
      IsoDateString.isIsoDateString('2023-03-31T01:02:03.004+02:00'),
    ).toBeTruthy();
  });

  it(`isIsoDateString() should return false for improperly formatted ISO date strings`, () => {
    expect(
      IsoDateString.isIsoDateString('2023-03-31 01:02:03.004Z'),
    ).toBeFalsy();
    expect(
      IsoDateString.isIsoDateString('2023-03-31T01:02:03.004'),
    ).toBeFalsy();
    expect(IsoDateString.isIsoDateString('2023-03-31')).toBeFalsy();
  });

  it('acceptable ISO date strings should convert to the same Date object', () => {
    // millisecond defaults to .000
    const preferred = new IsoDateString('2023-03-31T01:02:03.000Z');
    const preferredJsDate = preferred.toDate();
    const test = new IsoDateString('2023-03-31T01:02:03Z');
    expect(preferredJsDate).toEqual(test.toDate());
    expect(test.toString()).toMatch('2023-03-31T01:02:03Z');
  });

  it('ISO date string without milliseconds remain without milliseconds after conversion', () => {
    const test = new IsoDateString('2023-03-31T01:02:03Z');
    expect(test.toString()).toMatch('2023-03-31T01:02:03Z');
  });

  it('minutesAgo() should return a new IsoDateString minutes offset from original', () => {
    const test = new IsoDateString('2023-03-31T01:02:03.002Z');
    expect(test.minutesAgo(5).toString()).toMatch('2023-03-31T00:57:03.002Z');
    expect(test.minutesAgo('5').toString()).toMatch('2023-03-31T00:57:03.002Z');
    expect(test.minutesAgo(-5).toString()).toMatch('2023-03-31T01:07:03.002Z');
    expect(test.minutesAgo('-5').toString()).toMatch(
      '2023-03-31T01:07:03.002Z',
    );
    expect(
      new IsoDateString('2023-03-31T01:02:03.002Z').minutesAgo('-5').toString(),
    ).toMatch('2023-03-31T01:07:03.002Z');
  });

  it('hoursAgo() should return a new IsoDateString minutes offset from original', () => {
    const test = new IsoDateString('2023-03-31T01:02:03.002Z');
    expect(test.hoursAgo(5).toString()).toMatch('2023-03-30T20:02:03.002Z');
    expect(test.hoursAgo('5').toString()).toMatch('2023-03-30T20:02:03.002Z');
    expect(test.hoursAgo(-5).toString()).toMatch('2023-03-31T06:02:03.002Z');
    expect(test.hoursAgo('-5').toString()).toMatch('2023-03-31T06:02:03.002Z');
  });

  it('daysAgo() should return a new IsoDateString minutes offset from original', () => {
    const test = new IsoDateString('2023-03-31T01:02:03.002Z');
    expect(test.daysAgo(5).toString()).toMatch('2023-03-26T01:02:03.002Z');
    expect(test.daysAgo('5').toString()).toMatch('2023-03-26T01:02:03.002Z');
    expect(test.daysAgo(-5).toString()).toMatch('2023-04-05T01:02:03.002Z');
    expect(test.daysAgo('-5').toString()).toMatch('2023-04-05T01:02:03.002Z');
  });
});
