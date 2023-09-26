import { sub } from 'date-fns';

import { CveDate } from '../core/CveDate.js';
import { UpdateCommand } from './UpdateCommand.js';

describe(`UpdateCommand`, () => {

  it(`properly determines start window when only minutesAgo is specified`, async () => {
    const options = {
      minutesAgo: '55',
      stop: '2023-02-16T17:55:00.376Z',
    };
    const minutesAgo = parseInt(options[`minutesAgo`]);
    const now = CveDate.toISOString();
    const newOptions = UpdateCommand.determineQueryTimeOptions(options, now);
    expect(newOptions.start).toEqual(sub(new Date(now), { minutes: minutesAgo }).toISOString());
  });


  it(`properly ignores minutesAgo when start is specified`, async () => {
    const start = '2023-02-16T10:55:00.376Z';
    const options = {
      // minutesAgo: '122',
      start,
      stop: '2023-02-16T17:55:00.376Z',
    };
    const now = CveDate.toISOString();
    const newOptions = UpdateCommand.determineQueryTimeOptions(options, now);
    expect(newOptions.start).toEqual(start);
  });



  it(`properly ignores minutesAgo when startand minutesAgo are specified`, async () => {
    const start = '2023-02-16T10:55:00.376Z';
    const options = {
      minutesAgo: '240',
      start,
      stop: '2023-02-16T17:55:00.376Z',
    };
    const now = CveDate.toISOString();
    const newOptions = UpdateCommand.determineQueryTimeOptions(options, now);
    expect(newOptions.start).toEqual(start);
  });

});
