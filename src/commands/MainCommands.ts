/** object that encapsulates all tested and available cli commands */

import { Command } from 'commander';

import { DateCommand } from './DateCommand.js';
import { DeltaCommand } from './DeltaCommand.js';
import { GenericCommand } from './GenericCommand.js';
import { UpdateCommand } from './UpdateCommand.js';

export class MainCommands {

  protected _program;

  constructor(version: string) {
    this._program = new Command()
      .version(GenericCommand.setUtilityVersion(version), '-v, --version', 'output the version')
      .name(`cves`)
      .description(`CLI utility for working with CVEs`);

    const dateCommand = new DateCommand('date', this._program);
    const deltaCommand = new DeltaCommand(this._program);
    const updateCommand = new UpdateCommand(this._program);
  }

  async run() {
    await this._program.parseAsync(process.argv);
  }

}