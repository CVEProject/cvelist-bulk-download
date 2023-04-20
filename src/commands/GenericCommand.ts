import { Command } from 'commander';
import { CveDate } from '../core/CveDate.js';

/**
 * Abstract base class for common functionality to all other XXXCommand classes
 */
export abstract class GenericCommand {

  /** command name */
  _name: string;

  /** the Command object from the commander library */
  _program: Command;

  /** constructor
   * @param name the command name
   * @param program the Command object (from main.ts)
   */
  constructor(name: string, program: Command) {
    this._name = name;
    this._program = program;
    this.timerReset();
  }


  /** ----- version string ----- ----- */
  static __versionString: string;

  static getUtilityVersion(): string {
    return this.__versionString;
  }

  static setUtilityVersion(versionString: string): string {
    this.__versionString = versionString;
    return this.getUtilityVersion();
  }


  // ----- timer functions ----- -----

  //  @todo move to utils/timer.ts
  _startTimestamp: number;

  /** resets the command timer */
  timerReset(): number {
    this._startTimestamp = Date.now();
    return this._startTimestamp;
  }

  /** returns the number of seconds since timerReset() */
  timerSinceStart(): number {
    const currentTime = Date.now();
    return Math.abs(currentTime - this._startTimestamp);
  }

  // ----- standardized prerun, postrun, and run functions ----- -----

  /** common functions to run before run()
   *  All subclasses should call this first in the overridden run() function
  */
  prerun(options) {
    const now = new CveDate();
    if (options.display !== false) {
      console.log(`CVE Utils version ${GenericCommand.getUtilityVersion()}`);
      console.log(`  starting '${this._name}' command...`);
    }
    console.log(`  local  : ${now.asDateString((options.localTimezone) ? options.localTimezone : "America/New_York")}`);
    console.log(`  ISO    : ${now.asIsoDateString()}`);

    if (options.display !== false) {
      console.log(`environment variables:
        CVES_BASE_DIRECTORY: ${process.env.CVES_BASE_DIRECTORY}
        CVE_SERVICES_URL: ${process.env.CVE_SERVICES_URL}`);
      console.log(`${this._name} command options:  `);
      console.log(`${JSON.stringify(options, null, 2)}`);
      console.log();
    }
  }

  /** common functions to run after run()
   *  All subclasses should call this last in the overridden run() function
  */
  postrun(options) {
    if (options.logCurrentActivity) {
      console.log(`activities file in ${process.env.CVES_BASE_DIRECTORY} `);
    }
  }

  /** this is the method that performs the work for a specific command in the subclass
   *  All subclasses should override this
   */
  async run(options: any) { };
}
