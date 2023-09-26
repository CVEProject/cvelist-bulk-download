import { ActivityLog } from './ActivityLog.js';
import { activity0, activity1, activity2, activityNone } from './Activity.test.js';
import { FsUtils } from './fsUtils.js';

describe(`ActivityLog`, () => {

  const kPath = `test/tests/ActivityLog`;

  // Act before assertions
  beforeEach(async () => {
    const log = new ActivityLog({ path: kPath, logKeepPrevious: false });
    log.prepend(activity0);
    log.writeRecentFile();
    // always starts with a single activity in the log in kPath
  });

  // Teardown (cleanup) after assertions
  afterAll(() => {
    FsUtils.rm(`${kPath}/test/activities_recent.json`);
  });


  // @todo test constructor


  it(`prepend() correctly clears recent activities`, async () => {
    const log = new ActivityLog({ path: kPath, logKeepPrevious: true });
    log.clearActivities();
    expect(log._activities.length).toBe(0);
  });


  it(`getMostRecentActivity() correctly retrieves most recent activity`, async () => {
    const log = new ActivityLog({ path: kPath, logKeepPrevious: true });
    let activity = log.getMostRecentActivity();
    expect(activity.startTime).toMatch(`2023-02-07T16:47:00.000Z`);
    log.prepend(activity1);
    log.prepend(activity2);
    activity = log.getMostRecentActivity();
    expect(activity.startTime).toMatch(`2023-02-07T16:47:02.000Z`);
  });


  it(`prepend() correctly prepends to recent activities`, async () => {
    const log = new ActivityLog({ path: kPath, logKeepPrevious: true });
    expect(log._activities.length).toBe(1);
    // console.log(`log._activities`, log._activities);
    log.prepend(activity1);
    expect(log._activities.length).toBe(2);
    // console.log(`log._activities`, log._activities);
    log.writeRecentFile();
    const log2 = new ActivityLog({ path: kPath, logKeepPrevious: true });
    expect(log2._activities.length).toBe(2);
    expect(log2._activities[0]).toEqual(activity1);
    expect(log2._activities[1]).toEqual(activity0);
  });


  it(`readRecentFile() correctly reads in recent activities`, async () => {
    const log = new ActivityLog({ path: kPath, logKeepPrevious: true });
    expect(log._activities.length).toBe(1);
    expect(log._activities[0]).toEqual(activity0);
  });


  it(`writeRecentFile() correctly writes out recent activities in reverse chronological order`, async () => {
    const log = new ActivityLog({ path: kPath, logKeepPrevious: true });
    log.prepend(activity2);
    // console.log(`log._activities`, log._activities);
    const wroteLog = log.writeRecentFile();
    expect(wroteLog).toBeTruthy();
    const log2 = new ActivityLog({ path: kPath, logKeepPrevious: true });
    expect(log2._activities.length).toBe(2);
    expect(log2._activities[0]).toEqual(activity2);
    expect(log2._activities[1]).toEqual(activity0);
  });


  it(`writeRecentFile() does not log if there were no changes`, async () => {
    const log = new ActivityLog({ path: kPath, logAlways: false, logKeepPrevious: false });
    // console.log(`log._activities=${JSON.stringify(log._activities, null, 2)}`);
    log.prepend(activityNone);
    // console.log(`log._activities=${JSON.stringify(log._activities, null, 2)}`);
    const wroteLog = log.writeRecentFile();
    expect(wroteLog).toBeFalsy();
  });


  it(`writeRecentFile() does log even if there were no useful activity if alwaysLog set to true`, async () => {
    const log = new ActivityLog({ path: kPath, logAlways: true, logKeepPrevious: true });
    log.prepend(activityNone);
    // console.log(`log._activities`, log._activities);
    const wroteLog = log.writeRecentFile();
    expect(wroteLog).toBeTruthy();
    const log2 = new ActivityLog({ path: kPath, logKeepPrevious: true });
    expect(log2._activities.length).toBe(2);
    expect(log2._activities[0]).toEqual(activityNone);
    expect(log2._activities[1]).toEqual(activity0);
  });


  it(`writeRecentFile() correctly writes out recent activities when there are changes`, async () => {
    const log = new ActivityLog({ path: kPath, logAlways: false, logKeepPrevious: true });
    log.prepend(activity2);
    // console.log(`log._activities`, log._activities);
    log.writeRecentFile();
    const log2 = new ActivityLog({ path: kPath, logKeepPrevious: true });
    expect(log2._activities.length).toBe(2);
    expect(log2._activities[0]).toEqual(activity2);
    expect(log2._activities[1]).toEqual(activity0);
  });


  it(`writeRecentFile() always writes out recent activities when requested even when there are no activities`, async () => {
    const log = new ActivityLog({ path: kPath, logAlways: true, logKeepPrevious: true });
    log.writeRecentFile();
    const log2 = new ActivityLog({ path: kPath, logKeepPrevious: true });
    expect(log2._activities.length).toBe(1);
    expect(log2._activities[0]).toEqual(activity0);
  });
});
