/**
 * Abstract base class providing common functions for the CveXXXServices classes
 *  Note that the location of the CVE Services API, username, password, tokens, etc.
 *    are all set in the project's .env file, which must be defined before using
 */

export abstract class ApiBaseService {

  /** full url to CVE Service */
  _url = `${process.env.CVE_SERVICES_URL}`; // initialize to root

  /** default header when sending requests to CVE Services */
  _headers = {
    "Content-Type": "application/json",
    "CVE-API-ORG": `${process.env.CVE_API_ORG}`,
    "CVE-API-USER": `${process.env.CVE_API_USER}`,
    "CVE-API-KEY": `${process.env.CVE_API_KEY}`,
    "redirect": "follow"
  };


  /** customize ApiService for specific web service (e.g., '/api/cve')
   *  @param rootpath path starting with '/',  (e.g., '/api/cve')
   */
  constructor(rootpath: string) {
    this._url = `${this._url}${rootpath}`;
  }
}