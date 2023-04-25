/**
 * This file was automatically generated https://app.quicktype.io/?l=ts.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and regenerate this file.
*/
// To parse this data:
//
//   import { Convert, CveRecordV5 } from "./file";
//
//   const cve5 = Convert.toCve5(json);

export interface CveRecordV5 {
  containers?: Containers;
  cveMetadata?: CveMetadata;
  dataType?: string;
  dateVersion?: string;
  [property: string]: any;
}

export interface Containers {
  cna: Cna;
  [property: string]: any;
}

export interface Cna {
  affected: Affected[];
  configurations?: any[];
  credits?: any[];
  dateAssigned?: Date;
  datePublic?: Date;
  descriptions: CnaDescription[];
  exploits?: any[];
  impacts?: any[];
  metrics?: any[];
  problemTypes?: ProblemType[];
  providerMetadata: ProviderMetadata;
  references: Reference[];
  solutions?: any[];
  source?: string;
  tags?: any[];
  taxonomyMappings?: any[];
  timeline?: any[];
  title?: string;
  workarounds?: any[];
  [property: string]: any;
}

export interface Affected {
  product?: string;
  vendor?: string;
  versions?: Version[];
  [property: string]: any;
}

export interface Version {
  status?: string;
  version?: string;
  [property: string]: any;
}

export interface CnaDescription {
  lang?: string;
  value?: string;
  [property: string]: any;
}

export interface ProblemType {
  descriptions?: ProblemTypeDescription[];
  [property: string]: any;
}

export interface ProblemTypeDescription {
  description?: string;
  lang?: string;
  type?: string;
  [property: string]: any;
}

export interface ProviderMetadata {
  dateUpdated?: Date;
  orgId?: string;
  shortName?: string;
  [property: string]: any;
}

export interface Reference {
  name?: string;
  tags?: string[];
  url?: string;
  [property: string]: any;
}

export interface CveMetadata {
  assignerOrgId?: string;
  assignerShortName?: string;
  cveId?: string;
  datePublished?: string;
  dateReserved?: string;
  requesterUserId?: string;
  state?: string;
  [property: string]: any;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toCve5(json: string): CveRecordV5 {
    return JSON.parse(json);
  }

  public static cve5ToJson(value: CveRecordV5): string {
    return JSON.stringify(value);
  }
}
