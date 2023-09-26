import { Command } from 'commander';
import format from 'date-fns/format';
import endOfYesterday from 'date-fns/endOfYesterday';
import startOfYesterday from 'date-fns/startOfYesterday';

import { CveDate } from '../core/CveDate.js';
import { Delta } from '../core/Delta.js';
import { GenericCommand } from './GenericCommand.js';

export class DeltaCommand extends GenericCommand {
  constructor(program: Command) {
    const name = 'delta';
    super(name, program);
    this._program
      .command(name)
      .description('cve deltas (cve file changes)')
      .option(
        '--start <ISO timestamp>',
        'show CVEs changed starting from <ISO timestamp>, defaults to UTC midnight of today',
        `${CveDate.getMidnight().toISOString()}`,
      )
      .option(
        `--yesterday-all`,
        'do a delta of all of the CVEs changed yesterday',
      )
      // .option('--repository <path>', 'set repository, defaults to env var CVES_BASE_DIRECTORY', process.env.CVES_BASE_DIRECTORY)
      .action(this.run);
  }

  async run(options) {
    super.prerun(options);

    if (options.yesterdayAll) {
      const timestamp = startOfYesterday();
      const delta = await Delta.newDeltaFromGitHistory(
        timestamp.toISOString(),
        endOfYesterday().toISOString(),
      );
      console.log(`delta=${JSON.stringify(delta, null, 2)}`);
      console.log(delta.toText());
      const date = format(timestamp, 'yyyy-MM-dd');
      // const time = format(timestamp, 'HH');
      const deltaFilename = `${date}_delta_CVEs_at_end_of_day`;
      delta.writeFile(`${deltaFilename}.json`);
      delta.writeCves(undefined, `${deltaFilename}.zip`);
      delta.writeTextFile(`release_notes.md`);
    } else {
      const timestamp = new Date();
      const delta = await Delta.newDeltaFromGitHistory(options.start);
      // console.log(`delta=${JSON.stringify(delta, null, 2)}`);
      console.log(delta.toText());
      const date = format(timestamp, 'yyyy-MM-dd');
      const time = format(timestamp, 'HH');
      const deltaFilename = `${date}_delta_CVEs_at_${time}00Z`;
      delta.writeFile(`${deltaFilename}.json`);
      delta.writeCves(undefined, `${deltaFilename}.zip`);
      delta.writeTextFile(`release_notes.md`);
    }
    super.postrun(options);
  }
}