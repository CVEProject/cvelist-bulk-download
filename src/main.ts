
// set up environment
import * as dotenv from 'dotenv';
dotenv.config();

/** The version string is purposely set in code instead of in .env
 *  because it should be "baked in" to the code instead of potentially changeable at runtime.  
 *  This way, if there is a problem in CVEProject/cvelistV5, the output in github actions will
 *  reflect the actual version of this app (which will be tagged with a release tag), and it will
 *  simplify figuring out what the exact code looked like based on the tag.
 * 
 *  It is an extra step to remember to do when deploying, but is a worthwhile step to keep 2 dependent repositories synchronized. 
 * 
 *  The format follows semver for released software: Major.Minor.Patch, e.g., `1.0.0`
 *  However before release, it only uses the GitHub Project sprint number, e.g., `Sprint-1`
 */
const version = `Sprint-0`;

import { MainCommands } from './commands/MainCommands.js';
const program = new MainCommands(version);

await program.run();
