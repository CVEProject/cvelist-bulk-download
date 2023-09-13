import { Command } from 'commander';

import { GenericCommand } from './GenericCommand.js';
import { CveDate } from '../core/CveDate.js';

/** Command to print out current date in various formats */
export class DateCommand extends GenericCommand {
  constructor(program: Command) {
    const name = 'date';
    super(name, program);
    this._program
      .command(name)
      .description('current date')
      .option(
        '--local-timezone <IANA timezone>',
        'show current time in timezone',
        'America/New_York',
      )
      .option(
        '--after-midnight-by-at-most-secs <secs>',
        'return true iff current time is after midnight (ISO date) by at most specified secs',
        '18000',
      )
      .option('--midnight', 'show midnight of today (ISO date)')
      .option('--midnight-yesterday', 'show midnight of yesterday (ISO date)')
      .option('--yesterday', "show yesterday's date (ISO date)")
      .option('--terse', 'show only result, useful for bash scripts')
      .action(this.run);
  }

  async run(options) {
    super.prerun({ preamble: false, ...options });
    if (options.midnight) {
      const tag = options.terse ? '' : `  midnight:  `;
      console.log(`${tag}${CveDate.toISOString(CveDate.getMidnight())}`);
    } else if (options.midnightYesterday) {
      const tag = options.terse ? '' : `  midnightYesterday:  `;
      console.log(
        `${tag}${CveDate.toISOString(CveDate.getMidnightYesterday())}`,
      );
    } else if (options.yesterday) {
      const tag = options.terse ? '' : `  yesterday:  `;
      console.log(`${tag}${CveDate.getYesterday()}`);
    } else if (options.afterMidnightByAtMostSecs) {
      if (
        CveDate.getSecondsAfterMidnight() <=
        parseInt(options.afterMidnightByAtMostSecs)
      ) {
        console.log(`true`);
      } else {
        console.log(`false`);
      }
    }
    super.postrun(options);
  }
}