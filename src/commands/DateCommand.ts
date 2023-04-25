import { Command } from 'commander';

import { GenericCommand } from './GenericCommand.js';

/** Command to print out current date in various formats */
export class DateCommand extends GenericCommand {

  constructor(name: string, program: Command) {
    super(name, program);
    this._program
      .command(name)
      .description('current date')
      .option('--local-timezone <IANA timezone>', 'show current time in timezone', "America/New_York")
      .action(this.run);
  }

  async run(options) {
    super.prerun({ display: false, ...options });
    super.postrun({ display: false });
  }

}