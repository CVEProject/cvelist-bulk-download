import { Convert, CveRecordV5 } from "./CveRecordV5.js";


// constants that may change as database changes
const kCveId = `CVE-1999-0001`;
const kProviderOrgId = `f972b356-145d-4b2e-9a5c-b114d0982a3b`;
// const kLastCveModifiedTime = `2022-08-25T15:56:15`;

const _jsonstr = `
  {
    "containers": {
        "cna": {
            "providerMetadata": {
                "orgId": "${kProviderOrgId}"
            },
            "rejectedReasons": [
                {
                    "lang": "en",
                    "value": "abc",
                    "supportingMedia": [
                        {
                            "type": "test/markdown",
                            "base64": false,
                            "value": "*this* _is_ supporting media in ~markdown~"
                        }
                    ]
                }
            ],
            "replacedBy": [
                "CVE-1999-0006"
            ]
        }
    },
    "cveMetadata": {
        "cveId": "${kCveId}",
        "state": "REJECTED",
        "assignerOrgId": "de9616c5-7d01-43a8-bc53-ef8af45fa2f5"
    },
    "dataType": "CVE_RECORD",
    "dataVersion": "5.0"
  }
`;

describe(`CveRecordV5 class`, () => {

  // // Act before assertions
  // beforeAll(async () => {
  // });

  // // Teardown (cleanup) after assertions
  // afterAll(() => {
  // });

  it(`converts CVE5 json into CveRecordV5 class`, async () => {

    const obj: CveRecordV5 = Convert.toCve5(_jsonstr);
    expect(
      obj.containers.cna.providerMetadata.orgId
    ).toEqual(
      kProviderOrgId
    );
    expect(
      obj.dataVersion
    ).toEqual(
      "5.0"
    );
  });


  it(`converts CveRecordV5 class into CVE5 json`, async () => {

    const obj: CveRecordV5 = Convert.toCve5(_jsonstr);
    const json: string = Convert.cve5ToJson(obj);
    // console.log(`Convert.toCve5 -> `, json);
    expect(
      json
    ).toEqual(
      // need to do this to remove whitespace for comparison
      JSON.stringify(JSON.parse(_jsonstr))
    );
  });

});
