/** a wrapper/fascade class to make it easier to work with the file system SYNCRHONOUSLY */

import fs from 'fs';
import path from 'path';

import { unset } from 'lodash';
import AdmZip from 'adm-zip';

export class FsUtils {

  path: string;

  // /** constructor
  //  * @param path initializes a path
  //  */
  constructor(path) {
    this.path = path;
  }

  /**
   * synchronously returns whether the path exists 
   * (very thin wrapper for fs.existsSync which is NOT deprecated, unlike fs.exists)
   * @param path the full or partial path to test
   * @returns true iff the specified path exists
   */
  static exists(path: string): boolean {
    return fs.existsSync(path);
  }

  /**
   * synchronously removes the specified file iff it exists
   * @param path 
   * @returns true if the file was removed, false if it did not exist in the first place
   */
  static rm(path: string): boolean {
    if (FsUtils.exists(path)) {
      fs.rmSync(path);
      return true;
    }
    else {
      return false;
    }
  }

  static ls(path: string): string[] {
    const retval = [];
    fs.readdirSync(path).forEach(file => {
      // console.log(file);
      retval.push(file);
    });
    return retval;
  }

  static deleteProperties(obj: unknown, propPath: string): unknown {
    console.log(`deleteProperties:  ${propPath}`);
    const propPathComponents = propPath.split('.');
    if (propPathComponents.length === 1) {
      delete obj[propPathComponents[0]];
    }
    else {
      const cur = propPathComponents.shift();
      FsUtils.deleteProperties(obj[cur], propPathComponents.join('.'));
    }
    return obj;
  }

  /** returns true iff the content of file at path 1 and the file at path 2 are exactly the same
   *  @param path1 the relative or fullpath to a file
   *  @param path2 the relative or fullpath to another file
   *  @param ignoreJsonProps optional array of json paths to ignore, e.g., ["cveMetadata.datePublished", "cveMetadata.dateUpdated", "cveMetadata.dateReserved"]
   */
  static isSameContent(path1: string, path2: string, ignoreJsonProps?: string[]): boolean {
    if (!FsUtils.exists(path1) || !FsUtils.exists(path2)) {
      return false;
    }
    const buf1 = fs.readFileSync(path1);
    const buf2 = fs.readFileSync(path2);
    if (!ignoreJsonProps) {
      return buf1.equals(buf2);
    }
    else {
      let json1 = JSON.parse(buf1.toString());
      let json2 = JSON.parse(buf2.toString());
      ignoreJsonProps.forEach(item => {
        // json1 = FsUtils.deleteProperties(json1, item);
        // json2 = FsUtils.deleteProperties(json2, item);
        unset(json1, item);
        unset(json2, item);
      });
      console.log(`json1 : ${JSON.stringify(json1, null, 2)}`);
      console.log(`json2 : ${JSON.stringify(json2, null, 2)}`);
      return JSON.stringify(json1) == JSON.stringify(json2);
    }
  }

  /**
   * Synchronously generate a zip file from an array of files (no directories)
   * @param filepaths array of filenames to be zipped
   * @param resultFilepath filepath for resulting zip file
   * @param zipVirtualDir dir name in zip, defaults to `files`
   *                      (for example, if you want to add all the files 
   *                       into a zip folder called abc, 
   *                        you would pass 'abc' here)
   * @param dir path to directory where files are located
   */
  static generateZipfile(
    filepaths: string | string[],
    resultFilepath: string,
    zipVirtualDir = `files`,
    dir = ''
  ) {
    console.log(`generating zip file from ${filepaths} to ${resultFilepath}`);
    // if path to resultFilepath does not exist, recursively make them
    const dirname = path.dirname(resultFilepath);
    fs.mkdirSync(dirname, { recursive: true });
    const zip = new AdmZip;
    if (!Array.isArray(filepaths)) {
      filepaths = [filepaths];
    }
    filepaths.forEach(filepath => {
      const path = (dir.length > 0) ? `${dir}/${filepath}` : filepath;
      zip.addLocalFile(path, zipVirtualDir);
    });
    zip.writeZip(resultFilepath);
    // console.log(`zip file generated at ${resultFilepath}`);
  }

}