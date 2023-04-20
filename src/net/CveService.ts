import axios from 'axios';

import { ApiBaseService } from './ApiBaseService.js';
import { CveRecord } from '../core/CveRecord.js';
import { CveId, CveIdError } from '../core/CveRecord.js';

/**
 * options that can be used with the generic cve() method
 * Note that special CVE Services privileges on special CVE Services accounts may be needed
 * to fully use all functionality
 */
export interface CveApiOptions {
  /** set id to access specific CVE by CVE ID */
  id?: string,
  /** a query string corresponding to any of the query parameters allowed by the /cve endpoint 
   *  (e.g., page=5)
  */
  queryString?: string;
}

/**
 * Main class that provides functional access to the /cve Services API
 *  Note that the url of the CVE Services API, username, password, tokens, etc., all need to be 
 *    set in the project's .env file.
 *  - CVE Service endpoint specified in .env file (main.ts must call config() to set this up before this class can be used)
 */
export class CveService extends ApiBaseService {

  constructor() {
    super(`/api/cve`);
  }


  /** async method that returns some information about the the CVE Services API
   * Note:  Avoid using this since it is expensive and can run as long as 15 seconds
   * @return an object with information about the CVE Services API
   */
  async getCveSummary(): Promise<{}> {
    const response = await this.cve({ queryString: `page=1000` });
    return {
      totalCves: response.totalCount,
      totalCvePages: response.pageCount,
      cvesPerPage: response.itemsPerPage
    };
  }


  /** async method that returns the CVE Record associated with a given CVE id
   * @param id the CVE id string to retrieve
   * @return a CveRecord representing the record associated with a given CVE id
   */
  async getCveUsingId(id: string): Promise<CveRecord> {
    if (CveId.isValidCveId(id)) {
      const response = await this.cve({ id });
      const cve = new CveRecord(response);
      return cve;
    }
    else {
      throw new CveIdError(`Invalid CVE ID:  ${id}`);
    }
  }


  /** returns array of CVE that has been added/modified/deleted since timestamp window */
  async getAllCvesChangedInTimeFrame(start: string, stop: string): Promise<CveRecord[]> {
    let cveService = new CveService();
    let queryString = `time_modified.gt=${start}&time_modified.lt=${stop}`;
    const response = await cveService.cve({ queryString });
    let cves: CveRecord[] = [];
    response.cveRecords.forEach(obj => {
      const cve = new CveRecord(obj);
      cves.push(cve);
    });
    // console.log(`response number of items=`, response.cveRecords.length);

    return cves;
  };

  // ----- API wrapper

  /** wrapper for /cve 
   *  Note: avoid using this directly if one of the methods above can provide the functionality
  */
  async cve(option: CveApiOptions): Promise<any> {
    try {
      let url = `${this._url}`;
      if (option.id) {
        url += `/${option.id}`;
      }
      if (option.queryString) {
        // remove initial ? if present
        url += `?${option.queryString.split('?')[0]}`;
      }
      // console.log(`[cve]:  url=`, url);
      const { data, status } = await axios.default.get(
        url,
        {
          headers: this._headers
        }
      );

      switch (status) {
        case 200:
          // console.log(`[cve]:  status:  `, status);
          // console.log(`[cve]:  data:  `, JSON.stringify(data, null, 2));
          return data;
        default:
          console.log(`[cve]:  error: `, data);
          return data;
      }
    }
    catch (e) {
      console.log(`[cve]: caught error: `, e);
      return e;
    }
  };

}