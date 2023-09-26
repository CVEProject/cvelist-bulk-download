/** a wrapper/fascade class to make it easier to use git libraries from within cve utils */

import {
  CommitResult,
  Response,
  simpleGit, SimpleGit,
  StatusResult,
} from 'simple-git';

import { CveCore, CveCorePlus, CveId } from './CveCorePlus.js';
import { Delta, DeltaQueue } from './Delta.js';

export { StatusResult, Response };

export class Git {

  // fullOriginUrl: string;  // full URL with tokens and/or username/passwords
  localDir: string; // must be an existing directory
  git: SimpleGit;

  // other credentials are in GH_XXXXX environment variables

  /** constructor
   * @param init initializer
   */
  constructor(init: Partial<Git> = undefined) {
    // this.fullOriginUrl = init?.fullOriginUrl ? init.fullOriginUrl : `https://${process.env.GH_TOKEN}@github.com/${process.env.GH_OWNER}/${process.env.GH_REPO}.git`;
    this.localDir = init?.localDir ? init.localDir : `${process.cwd()}/${process.env.CVES_BASE_DIRECTORY}`;
    // console.log(`git working directory set to ${this.localDir}`);
    this.git = simpleGit(this.localDir, { binary: 'git' });
    this.git.cwd(this.localDir);
  }

  /** returns git status in a promise 
   *  Note that while StatusResult shows files with paths relative to pwd, working
   *  with those files (for example, add or rm) requires a full path
  */
  async status(): Promise<StatusResult> {
    const status = await this.git.status();
    // console.log(`status=${JSON.stringify(status, null, 2)}`);
    return status;
  }

  // generic error callback
  static genericCallback(err) {
    if (err) {
      throw err;
      console.log(`git error:  ${err}`);
    };
  }


  /** git add files 
   *  Note that fullPathFiles must be either full path specs or partial paths from this.localDir
   *  Note that fullPathFiles should NOT be a directory
   * 
  */
  async add(fullPathFiles: string | string[]): Promise<Response<string>> {
    // console.log(`adding ${JSON.stringify(fullPathFiles)}`);
    const retval = this.git.add(fullPathFiles, Git.genericCallback);
    return retval;
  }


  /** git rm files 
   *  Note that fullPathFiles must be either full path specs or partial paths from this.localDir
   *  Note that fullPathFiles should NOT be a directory
  */
  async rm(fullPathFiles: string | string[]): Promise<Response<void>> {
    const retval = this.git.rm(fullPathFiles, Git.genericCallback);
    return retval;
  }


  // // see https://github.com/steveukx/git-js/blob/main/simple-git/test/unit/fetch.spec.ts for examples
  // async fetch(): Promise<Response<FetchResult>> {
  //   const retval = this.git.fetch(Git.genericCallback)
  //   return retval
  // }

  // @todo:  implement pull

  /**
   * commits staged files
   * @param msg commit message 
   * @returns CommitResult
   * 
   */
  async commit(msg: string): Promise<CommitResult> {
    const retval = this.git.commit(msg, Git.genericCallback);
    return retval;
  }

  /**
   *  logs commit hash and date between time window
   */
  async logCommitHashInWindow(start: string, stop: string): Promise<string[]> {
    // console.log(`logCommitHashInWindow(${start},${stop})`);
    const response = await this.git.raw(
      'log',
      `--after="${start}"`,
      `--before="${stop}"`,
      // `--pretty=format:"%H %ci"`,
      `--pretty=format:"%H"`,
      `--relative=${this.localDir}`
    );
    let retval: string[] = [];
    if (response.length > 0) {
      let split = response.split('\n');
      split.forEach(item => retval.push(item.split('"')[1]));
    }
    // console.log(`retval from logCommitHashInWindow():  ${retval}`);
    return retval;
  }

  /**
   *  logs changed filenames in time window
   */
  async logChangedFilenamesInTimeWindow(start: string, stop: string): Promise<string[]> {
    // console.log(`logChangedFilenamesInTimeWindow(${start},${stop})`);
    const commits = await this.logCommitHashInWindow(start, stop);
    // console.log(`commits=${commits}`);
    if (commits.length > 0) {
      const files = await this.git.raw(
        'diff',
        `--name-only`,
        `${commits[0]}..${commits[commits.length - 1]}`,
        `--relative=${this.localDir}`);
      // console.log(`retval from logChangedFilenamesInTimeWindow:  ${files}`);
      let retval: string[] = files.split('\n');
      if (retval[retval.length - 1] === "") {
        // remove last empty \n
        retval.pop();
      }
      return retval;
    }
    else {
      return [];
    }
  }

  /**
   *  logs deltas in time window
   */
  async logDeltasInTimeWindow(start: string, stop: string): Promise<Delta> {
    // console.log(`logChangedFilenamesInTimeWindow(${start},${stop})`);
    const commits = await this.logCommitHashInWindow(start, stop);
    // console.log(`retval from logCommitHashInWindow:  ${JSON.stringify(commits)}`);
    const delta = new Delta();

    if (commits.length > 0) {
      const data = await this.git.raw(
        'diff',
        `--raw`,
        `${commits[commits.length - 1]}..${commits[0]}`,
        `--relative=${this.localDir}`);
      console.log(`retval from diff between commits ${commits[commits.length - 1]}..${commits[0]}:\n  ${data}`);
      const lines: string[] = data.split('\n');
      // remove last empty \n
      lines.pop();
      lines.forEach(line => {
        const [a, b, c, d, subline] = line.split(' ');
        const action = subline[0];
        const path = `${this.localDir}/${subline.substring(1).trim()}`;
        console.log(`line=${line}`);
        console.log(`action=${action}  path=${path}`);
        const cveId = CveCore.getCveIdfromRepositoryFilePath(path);
        if (CveId.isValidCveId(cveId)) {
          switch (action) {
            case 'A':
              delta.add(CveCorePlus.fromJsonFile(path), DeltaQueue.kNew);
              break;
            case 'M':
              delta.add(CveCorePlus.fromJsonFile(path), DeltaQueue.kUpdated);
              break;
            default:
              delta.add(CveCorePlus.fromJsonFile(path), DeltaQueue.kError);
              break;
          }
        }
        else {
          //skip since it's not a CVE
        }
      });
    }
    return delta;
  }
}