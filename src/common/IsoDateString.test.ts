import * as dotenv from 'dotenv';
import { IsoDateStringRegEx, IsoDateString } from './IsoDateString.js';

dotenv.config();

describe(`IsoDateString`, () => {

  it(`constructor should construct a new object if param is properly formatted`, () => {
    expect(() => { new IsoDateString("2023-03-31T01:02:03.004Z"); }).not.toThrow(TypeError);
    expect(() => { new IsoDateString("2023-03-31T01:02:03Z"); }).not.toThrow(TypeError);
    expect(() => { new IsoDateString("2023-03-31T01:02:03.004-04:00"); }).not.toThrow(TypeError);
    expect(() => { new IsoDateString("2023-03-31T01:02:03.004-04:30"); }).not.toThrow(TypeError);
  });


  it(`constructor should result in a proper JS Date object`, () => {
    const iso = new IsoDateString("2023-03-31T01:02:03.004Z");
    const jsDate = iso.toDate();
    expect(jsDate.getFullYear()).toBe(2023);
    expect(jsDate.getMonth()).toBe(2);  // month, zero based
    expect(jsDate.getDate()).toBe(30);  // date of month, zero based
    expect(jsDate.getUTCHours()).toBe(1);
    expect(jsDate.getMinutes()).toBe(2);
    expect(jsDate.getSeconds()).toBe(3);
    expect(jsDate.getMilliseconds()).toBe(4);

  });


  it(`constructor throws TypeError if improper format`, () => {
    expect(() => { new IsoDateString("2023-03-31 01:02:03.004Z"); }).toThrow(TypeError);
    expect(() => { new IsoDateString("2023-03-31T01:02:03.004"); }).toThrow(TypeError);
    expect(() => { new IsoDateString("2023-03-31"); }).toThrow(TypeError);
  });


  it(`length() correctly returns length of date string`, () => {
    let dateStr = "2023-03-31T01:02:03.004Z";
    let date = new IsoDateString(dateStr);
    expect(date.length()).toBe(dateStr.length);

    dateStr = "2023-03-31T01:02:03Z";
    date = new IsoDateString(dateStr);
    expect(date.length()).toBe(dateStr.length);
  });


  it(`toString() correctly returns the date string`, () => {
    let dateStr = "2023-03-31T01:02:03.004Z";
    let date = new IsoDateString(dateStr);
    expect(date.toString()).toBe(dateStr);

    dateStr = "2023-03-31T01:02:03Z";
    date = new IsoDateString(dateStr);
    expect(date.toString()).toBe(dateStr);
  });


  it(`toDate() correctly returns the date`, () => {
    let dateStr = "2023-03-31T01:02:03.004Z";
    let jsDate = new Date(dateStr);
    let date = new IsoDateString(dateStr);
    expect(date.toDate()).toEqual(jsDate);
    expect(date.toString()).toBe(jsDate.toISOString());

    dateStr = "2023-03-31T01:02:03Z";
    jsDate = new Date(dateStr);
    date = new IsoDateString(dateStr);
    expect(date.toDate()).toEqual(jsDate);
    expect(date.toDate().toISOString()).toBe(jsDate.toISOString());
  });


  // ----- static functions ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----


  it(`isIsoDateString() should return true for properly formatted ISO date strings`, () => {
    expect(IsoDateString.isIsoDateString("2023-03-31T01:02:03.004Z")).toBeTruthy();
    expect(IsoDateString.isIsoDateString("2023-03-31T01:02:03Z")).toBeTruthy();
    expect(IsoDateString.isIsoDateString("2023-03-31T01:02:03.004+02:00")).toBeTruthy();
  });


  it(`isIsoDateString() should return false for improperly formatted ISO date strings`, () => {
    expect(IsoDateString.isIsoDateString("2023-03-31 01:02:03.004Z")).toBeFalsy();
    expect(IsoDateString.isIsoDateString("2023-03-31T01:02:03.004")).toBeFalsy();
    expect(IsoDateString.isIsoDateString("2023-03-31")).toBeFalsy();
  });


  it("acceptable ISO date strings should convert to the same Date object", () => {
    // millisecond defaults to .000
    const preferred = new IsoDateString("2023-03-31T01:02:03.000Z");
    const preferredJsDate = preferred.toDate();
    const test = new IsoDateString("2023-03-31T01:02:03Z");
    expect(preferredJsDate).toEqual(test.toDate());
    expect(test.toString()).toMatch("2023-03-31T01:02:03Z");
  });


  it("ISO date string without milliseconds remain without milliseconds after conversion", () => {
    const test = new IsoDateString("2023-03-31T01:02:03Z");
    expect(test.toString()).toMatch("2023-03-31T01:02:03Z");
  });
});