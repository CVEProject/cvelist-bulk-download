/** a wrapper/fascade class to make it easier to work with the file system SYNCRHONOUSLY */

import fs from 'fs';
import path from 'path';
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
    zipVirtualDir: string = `files`,
    dir: string = ''
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

  // /**
  //  * Synchronously add/overwrite a file to an existing zip file
  //  * @param filepath of file to add/update to existing zip file
  //  * @param zipFilepath filename for resulting zip file
  //  * @param zipVirtualDir dir name in zip, defaults to `files`
  //  *                      (for example, if you want to add all the files 
  //  *                       into a zip folder called abc, 
  //  *                        you would pass 'abc' here)
  //  */
  // static updateZipfile(filepath: string, zipFilepath: string, zipVirtualDir: string = `files`) {
  //   console.log(`updating ${filepath} to ${zipFilepath}`);
  //   const zip = new AdmZip(zipFilepath);
  //   zip.addLocalFile(filepath, zipVirtualDir);
  //   zip.writeZip(zipFilepath);
  // }

}