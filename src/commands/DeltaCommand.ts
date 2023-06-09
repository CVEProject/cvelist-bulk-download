import { Command } from 'commander';
import format from 'date-fns/format';

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
      .option('--after <ISO timestamp>', 'show CVEs changed since <timestamp>, defaults to UTC midnight of today', `${CveDate.getMidnight().toISOString()}`)
      // .option('--repository <path>', 'set repository, defaults to env var CVES_BASE_DIRECTORY', process.env.CVES_BASE_DIRECTORY)
      .action(this.run);
  }

  async run(options) {
    super.prerun(options);
    // console.log(`delta command called with ${JSON.stringify(options, null, 2)}`);

    const timestamp = new Date();
    const delta = await Delta.newDeltaFromGitHistory(options.after);
    // console.log(`delta=${JSON.stringify(delta, null, 2)}`);
    console.log(delta.toText());
    const date = format(timestamp, 'yyyy-MM-dd');
    const time = format(timestamp, 'HH');
    const deltaFilename = `${date}_delta_CVEs_at_${time}00Z`;
    delta.writeFile(`${deltaFilename}.json`);
    delta.writeCves(undefined, `${deltaFilename}.zip`);
    delta.writeTextFile(`release_notes.md`);
    super.postrun(options);
  }

}