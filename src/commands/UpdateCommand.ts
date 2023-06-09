import sub from 'date-fns/sub';
import { Command } from 'commander';

import { ActivityLog } from '../core/ActivityLog.js';
import { CveDate } from '../core/CveDate.js';
import { CveService } from '../net/CveService.js';
import { CveUpdater } from '../net/CveUpdater.js';
import { Delta } from '../core/Delta.js';
import { GenericCommand } from './GenericCommand.js';
import { Git } from '../core/git.js';

export class UpdateCommand extends GenericCommand {

  /** default number of minutes to look back when a start date is not specified */
  static defaultMins = parseInt(process.env.CVES_DEFAULT_UPDATE_LOOKBACK_IN_MINS || "180");

  constructor(program: Command) {
    super('update', program);
    const now = new Date();
    this._program.command('update')
      .description('update CVEs using CVE Services')
      // .option('--log-keep-previous', 'keeps previous run instead of clearing it first', false)
      // .option('--logfile <string>', 'activies log filename', `${process.env.CVES_RECENT_ACTIVITIES_FILENAME}`)
      .option('--minutes-ago <number>', `start window at <number> of minutes ago (default behavior)`, `${UpdateCommand.defaultMins}`)
      // .option('--output <string>', 'output directory', `./${process.env.CVES_BASE_DIRECTORY}`)
      .option('--start <ISO string>', `specific start window, overrides any specifications from --minutes-ago`)
      .option('--stop <ISO string>', 'stop window, defaults to now', now.toISOString())
      // .option('--url <url>', 'source serve url', process.env.CVE_SERVICES_URL)
      // .option('--baseline-date <ISO string>', 'set baseline date from which to build deltas', CveDate.getMidnight().toISOString())
      .action(this.run);
    this.timerReset();
  }

  /** determines the time options (start, stop, minutesAgo) behavior */
  static determineQueryTimeOptions(options, now: string) {
    const newOptions = { ...options };
    const minutesAgo = parseInt(newOptions[`minutesAgo`]);
    if (options.start) {
      console.log(`ignoring minutes-ago (${newOptions.minutesAgo}), starting window is set to ${newOptions.start}`);
    }
    else {
      newOptions.start = sub(new Date(now), { minutes: minutesAgo }).toISOString();
      console.log(`starting window calculated from default --minutes-ago (${minutesAgo}): ${newOptions.start}`);
    }
    return newOptions;
  }

  /** runs the command using user set or default/calculated options */
  async run(options) {
    super.prerun(options);

    super.timerReset();
    // console.log(`update started at ${CveDate.toISOString()}`);

    const cveService = new CveService();
    const updater = new CveUpdater(`update command`, {
      path: options.output,
      filename: options.logfile,
      logAlways: options.logAlways,
      logKeepPrevious: true
    });

    // determine setup window from params
    const newOptions = UpdateCommand.determineQueryTimeOptions(options, CveDate.toISOString());
    const activityLog = new ActivityLog({
      path: options.output,
      filename: options.logfile,
      logAlways: options.logAlways,
      logKeepPrevious: true
    });

    // update by window
    const args = process.argv;
    // const countResp = await cveService.cve({ queryString: `count_only=1` });
    const countResp = await cveService.cve({ queryString: `count_only=1&time_modified.gt=${newOptions.start}&time_modified.lt=${newOptions.stop}` });
    console.log(`count=${countResp.totalCount}`);
    if (countResp.totalCount > 0) {
      // @todo: change 500 to .env variable
      const activity = await updater.getCvesInWindow(newOptions.start, newOptions.stop, 500, `${process.env.CVES_BASE_DIRECTORY}`);
      console.log(`activity=`, JSON.stringify(activity, null, 2));

      // log activity
      if (options.logAlways || activity?.delta?.numberOfChanges > 0) {
        // console.log(`will write recent activities`)

        activityLog.prepend(activity);
        activityLog.writeRecentFile();

        // write delta file
        const delta2 = await Delta.newDeltaFromGitHistory(options.baselineDate, null, process.env.CVES_BASE_DIRECTORY);
        // console.log(`delta=${JSON.stringify(delta, null, 2)}`);
        console.log(delta2.toText());
        // delta2.writeFile();
        delta2.writeCves();
        delta2.writeTextFile('release_notes.md');

        const localDir = `${process.cwd()}/${process.env.CVES_BASE_DIRECTORY}`;
        const git = new Git({ localDir: `${process.cwd()}` });
        let ret;//: Response<string>
        ret = await git.add(`${localDir}`);
        console.log(`git add repository files completed`);
        ret = await git.commit(`${activity.delta.toText()}`);
        console.log(`git commit returned ${JSON.stringify(ret, null, 2)}`);
      }
    }
    else {
      console.log(`no new or updated CVEs`);
    }
    console.log(`operation completed in ${super.timerSinceStart() / 1000} seconds at ${CveDate.toISOString()}`);
    super.postrun(newOptions);
  }
}