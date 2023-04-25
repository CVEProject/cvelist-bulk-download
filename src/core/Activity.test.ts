import * as dotenv from 'dotenv';
import { cloneDeep } from 'lodash';
import {
  ActivityStep,
  Activity,
  ActivityStatus,
  ActivityProps
} from './Activity.js';
import { Delta } from './Delta.js';
dotenv.config();


export const defaultStep0: ActivityStep = {
  stepDescription: "step0",
  startTime: "2023-02-07T16:47:08.000Z",
  stopTime: "2023-02-07T16:47:08.822Z",
  duration: "822 msecs",
  summary: {
    startWindow: "2023-02-07T16:47:08.822Z",
    endWindow: "2023-02-07T16:48:08.822Z",
    count: 1,
    cveIds: ["CVE-1970-0001"]
  }
};

export const defaultStep1: ActivityStep = {
  stepDescription: "step1",
  startTime: "2023-02-07T16:47:08.000Z",
  stopTime: "2023-02-07T16:47:08.822Z",
  duration: "822 msecs",
  summary: {
    startWindow: "2023-02-07T16:47:08.822Z",
    endWindow: "2023-02-07T16:48:08.822Z",
    count: 1,
    cveIds: ["CVE-2022-43762"]
  }
};

export const defaultStep5: ActivityStep = {
  stepDescription: "step5",
  startTime: "2023-02-07T16:47:08.000Z",
  stopTime: "2023-02-07T16:47:08.822Z",
  duration: "822 msecs",
  summary: {
    startWindow: "2023-02-07T16:47:08.822Z",
    endWindow: "2023-02-07T16:48:08.822Z",
    count: 5,
    cveIds: [
      "CVE-2021-3958",
      "CVE-2022-2094",
      "CVE-2022-3437",
      "CVE-2022-41620",
      "CVE-2022-43761"
    ]
  }
};

export const defaultStepPage1: ActivityStep = {
  stepDescription: "stepPage1",
  startTime: "2023-02-07T16:47:09.000Z",
  stopTime: "2023-02-07T16:47:09.822Z",
  duration: "1234 msecs",
  summary: {
    startWindow: "2023-03-08T16:47:05.822Z",
    endWindow: "2023-03-08T16:48:09.822Z",
    page: 1,
    count: 1,
    cveIds: [
      "CVE-2022-3958"
    ]
  }
};

export const defaultStepPage2: ActivityStep = {
  stepDescription: "stepPage2",
  startTime: "2023-02-07T16:47:08.000Z",
  stopTime: "2023-02-07T16:47:08.822Z",
  duration: "1234 msecs",
  summary: {
    startWindow: "2023-03-08T16:47:08.822Z",
    endWindow: "2023-03-08T16:48:08.822Z",
    page: 2,
    count: 2,
    cveIds: [
      "CVE-2022-3958",
      "CVE-2022-3959"
    ]
  }
};

export const defaultStepNone: ActivityStep = {
  stepDescription: "stepNone",
  startTime: "2023-02-07T16:47:00.000Z",
  stopTime: "2023-02-07T16:47:00.822Z",
  duration: "1234 msecs",
  summary: {
    startWindow: "2023-03-08T16:47:00.822Z",
    endWindow: "2023-03-08T16:48:00.822Z",
    count: 0,
    cveIds: []
  }
};

export const defaultDelta: Delta = new Delta();

export const defaultActivity: Activity = new Activity({
  startTime: "2023-02-07T16:47:00.000Z",
  stopTime: "2023-02-07T16:47:00.822Z",
  duration: "822 msecs",
  // type: `manual`,
  name: `test`,
  url: ``,
  status: ActivityStatus.Completed,
  errors: [],
  notes: {},
  delta: defaultDelta,
  steps: [defaultStep0]
});

export const activity0: Activity = cloneDeep(defaultActivity);

export const activity1: Activity = cloneDeep(defaultActivity);
activity1.startTime = "2023-02-07T16:47:01.000Z";
activity1.stopTime = "2023-02-07T16:47:01.999Z";
activity1.prependStep(defaultStep1);


export const activity2: Activity = cloneDeep(defaultActivity);
activity2.startTime = "2023-02-07T16:47:02.000Z";
activity2.stopTime = "2023-02-07T16:47:02.999Z";
activity2.prependStep(defaultStepPage1);
activity2.prependStep(defaultStepPage2);


export const activityNone: Activity = new Activity({
  startTime: "2023-02-07T16:47:08.000Z",
  stopTime: "2023-02-07T16:47:08.822Z",
  duration: "822 msecs",
  // type: `manual`,
  name: `activityNone`,
  url: ``,
  status: ActivityStatus.Completed,
  errors: [],
  notes: {},
  delta: defaultDelta,
  steps: []
});

describe(`Activity`, () => {

  // default test objects ----- ----- 

  it(`correctly constructs defaultActivity`, async () => {
    const activity = defaultActivity;
    expect(activity.steps.length).toBe(1);
    expect(activity.steps[0].stepDescription).toMatch(`step0`);
  });


  it(`correctly constructs activity0`, async () => {
    const activity = activity0;
    expect(activity.equalTo(activity0)).toBeTruthy();
  });

  it(`correctly constructs activity1`, async () => {
    const activity = activity1;
    expect(activity.steps.length).toBe(2);
    expect(activity.steps[0].stepDescription).toMatch(`step1`);
    expect(activity.steps[0].summary.count).toBe(1);
    expect(activity.steps[1].stepDescription).toMatch(`step0`);
    expect(activity.steps[1].summary.count).toBe(1);
  });

  it(`correctly constructs activity2`, async () => {
    const activity = activity2;
    expect(activity.steps.length).toBe(3);
    expect(activity.steps[0].stepDescription).toMatch(`stepPage2`);
    expect(activity.steps[0].summary.count).toBe(2);
    expect(activity.steps[1].stepDescription).toMatch(`stepPage1`);
    expect(activity.steps[1].summary.count).toBe(1);
  });

  it(`correctly constructs activityNone`, async () => {
    const activity = activityNone;
    expect(activity.steps.length).toBe(0);
    // expect(activity.steps[0].stepDescription).toMatch(`step0`);
    // expect(activity.steps[0].summary.count).toBe(1);
  });

  // constructor ----- ----- 

  it(`correctly constructs an Activity object using full ActivityProps`, async () => {
    const activity = new Activity(activity1);
    expect(activity.equalTo(activity1)).toBeTruthy();
  });

  it(`correctly deep clones ActivityProps`, async () => {
    const props: ActivityProps = {
      startTime: "2023-02-07T16:47:08.000Z",
      stopTime: "2023-02-07T16:47:08.822Z",
      duration: "822 msecs",
      // type: `manual`,
      name: `test`,
      url: ``,
      status: ActivityStatus.Completed,
      errors: [{ "error": "error" }],
      notes: {
        "note1": "notes"
      },
      delta: defaultDelta,
      steps: [defaultStep0]
    };
    const activity = new Activity(props);
    expect(activity.errors).not.toBe(props.errors);
    expect(activity.notes).not.toBe(props.notes);
    expect(activity.delta).not.toBe(props.delta);
    expect(activity.delta.new).not.toBe(props.delta.new);
    expect(activity.delta.updated).not.toBe(props.delta.updated);
    expect(activity.steps).not.toBe(props.steps);

    expect(activity.errors.length).toBe(1);
    expect(activity.notes['note1']).toMatch("notes");
    // console.log(`notes=${JSON.stringify(activity.notes)}`);
    expect(activity.delta.new.length).toBe(0);
    expect(activity.delta.updated.length).toBe(0);
    expect(activity.steps.length).toBe(1);
  });


  // equalTo() ----- -----

  it(`equalTo() correctly returns an identical activity`, async () => {
    const activity = new Activity(activity1);
    expect(activity.equalTo(activity1)).toBeTruthy();
  });

  it(`equalTo() correctly returns a totally different activity`, async () => {
    const activity = new Activity(activity1);
    expect(activity.steps[0].stepDescription).not.toMatch(activity2.steps[0].stepDescription);
    expect(activity.equalTo(activity2)).toBeFalsy();
  });

  it(`equalTo() correctly returns a null activity`, async () => {
    const activity = new Activity(null);
    expect(activity.equalTo(activity1)).toBeFalsy();
  });

  // prependStep() ----- ----- 

  it(`prependStep() correctly prepends a step`, async () => {
    const activity = new Activity(defaultActivity);
    expect(activity.steps.length).toBe(1);
    expect(activity.steps[0].stepDescription).toMatch(`step0`);
    activity.prependStep(defaultStep5);
    // console.log(`activity.steps=`, activity.steps);
    expect(activity.steps.length).toBe(2);
    expect(activity.steps[0].stepDescription).toMatch(`step5`);
    expect(activity.steps[0].summary.count).toBe(5);
    expect(activity.steps[1].summary.count).toBe(1);
  });

  it(`prependStep() does not prepends a step if the results of the step is zero changes`, async () => {
    const activity = new Activity(defaultActivity);
    expect(activity.steps.length).toBe(1);
    expect(activity.steps[0].stepDescription).toMatch(`step0`);
    activity.prependStep(defaultStepNone);
    // console.log(`activity after prepending stepNone = ${JSON.stringify(activity, null, 2)}`);
    expect(activity.steps.length).toBe(1);
    expect(activity.steps[0].stepDescription).toMatch(`step0`);
    expect(activity.steps[0].summary.count).toBe(1);
  });
});
