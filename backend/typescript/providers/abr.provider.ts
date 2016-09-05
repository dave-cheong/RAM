/*
 * ## Overview
 * Retrieve company information from the ABR API - by providing
 * either an ABN or a name for the company. The name does not have
 * to match exactly.
 *
 * ## Usage
 * Returns a promise that, when fulfilled, will
 * provide an array of RAM/commons/abr/ABRentry items. Call
 * functions as follows:
 *
 * import ABR from '../providers/abr.provider';
 * import { ABRentry } from '../../../commons/abr';
 * const list:ABRentry = ABR.searchABN(abn);
 * const list:ABRentry = ABR.searchNames(name);
 *
 * ## What's in a Name?
 * The name can be sole trader name, company name, trading name
 * or a number of industry specific name types.
 *
 * If no results are found the result is returned as undefined.
 * At the controller level this is used to send a 404.
 *
 * ## Configuration
 *
 * conf.abrAuthenticationGuid // supplied by Industry to use ABR
 *
 * ## Mocking
 *
 * If the configuration item is empty, mock data is returned. The
 * provider does not access the Internet. The mock return is the
 * same data independent of name or abn provided.
 *
 * Sample ABNs
 * 12586695715 34241177887 49093669660 33531321789 76093555992
 * 53772093958 85832766990 56006580883 78345431247 48212321102
 */

import * as request from 'superagent';
import { ABRentry } from '../../../commons/api';
/* tslint:disable:no-var-requires */
const xml2js = require('xml2js').parseString;
import { conf } from '../bootstrap';

/* tslint:disable:no-any */

// build a name string from an ABR sole trader name object
const individualName = (field:any) =>
    field ? field[0].fullName ? field[0].fullName[0]
        : (field[0].givenName[0]+' '
            +field[0].otherGivenName[0]+' '
            +field[0].familyName[0])
        : null;

// All organisation types have the same name structure
const organisationName = (field:any) =>
    field ? field[0].organisationName[0] : null;

// Return the name for the organisation based on which field
// is provided in the record.
const extractName = (item:any) =>
  individualName(item.legalName) ||
  organisationName(item.mainName) ||
  organisationName(item.businessName) ||
  organisationName(item.PBIEName) ||
  organisationName(item.AWEFName) ||
  organisationName(item.dgrFundName) ||
  organisationName(item.mainTradingName) ||
  organisationName(item.otherTradingName) ||
  '';

  const address = (mainBusinessPhysicalAddress:any) =>
    mainBusinessPhysicalAddress
      ? mainBusinessPhysicalAddress[0]
      : { stateCode: [''], postcode: [''] };

// build the static typed organisation details for the rest
// of the system to use (client and server)
const buildOrganisationEntry = (item:any):ABRentry => {
    //console.log(JSON.stringify(item, null, 2));
    const addressRecord = address(item.mainBusinessPhysicalAddress);
    // return {
    //     abn:        item.ABN[0].identifierValue[0],
    //     name:       extractName(item),
    //     state:      addressRecord.stateCode[0],
    //     postcode:   addressRecord.postcode[0],
    //     type:       item.entityType[0].entityDescription[0],
    //     status:     item.entityStatus[0].entityStatusCode[0],
    //     from:       item.entityStatus[0].effectiveFrom[0],
    //     to:         item.entityStatus[0].effectiveTo[0]
    // };
    return {
        abn:        item.ABN[0].identifierValue[0],
        name:       extractName(item),
        state:      addressRecord.stateCode[0],
        postcode:   addressRecord.postcode[0]
    };
};

// Retrieval by name will return a list of organisations that
// may match the name given. Inactive records are removed and
// the data is pushed into the ABRentry format.
const extractOrganisations = (response:any):[ABRentry] => {
    const list = response.ABRPayloadSearchResults
    .response[0].searchResultsList;
    if (list) {
        return list[0].searchResultsRecord
        // === does not work without toString(). What is xml2js returning?
        // .filter((item:any) =>
        //     item.ABN[0].identifierStatus.toString() === 'Active')
        .map(buildOrganisationEntry);
    } else {
        return undefined;
    }
};

// This is the container for the version that talks to the ABR API
class RealABR {
    // split string so the linter doesn't have a hissy fit
    private static domain =
    'http'+'://abr.business.gov.au/abrxmlsearchRPC/AbrXmlSearch.asmx/';

    public static searchABN(abn:string) {
        return new Promise((resolve, reject) =>
            request.get(this.domain+'ABRSearchByABN')
            .query({
                searchString:               abn,
                includeHistoricalDetails:   'N',
                authenticationGuid:         conf.abrAuthenticationGuid
            }).end((err, resp) => {
                if (err) { reject(err); }
                xml2js(resp.text, (err2:any, result:any) => {
                    if (err2) { return reject(err2); }
                    try {
                        const businessEntity =
                        result.ABRPayloadSearchResults
                        .response[0].businessEntity;
                        if (businessEntity) {
                                resolve([buildOrganisationEntry(
                                businessEntity[0])]);
                            } else {
                                resolve(undefined);
                            }
                    } catch (err3) { reject(err3); }
                });
            }));
    }

    public static searchNames(name:string) {
        return new Promise((resolve, reject) =>
        // default search for all states and all names
        request.get(this.domain+'ABRSearchByNameSimpleProtocol')
        .query({
            name:               name,
            postcode:           '',
            legalName:          '',
            tradingName:        '',
            NSW:'', SA:'', VIC:'', QLD:'',
            ACT:'', WA:'', TAS:'', NT:'',
            authenticationGuid: conf.abrAuthenticationGuid
        }).end((err, resp) => {
            if (err) { reject(err); }
            xml2js(resp.text, (err2:any, result:any) => {
                if (err2) { return reject(err2); }
                try {
                    resolve(extractOrganisations(result));
                } catch (err3) {
                    reject(err3);
                }
            });
        }));
    }
}

// This is the container for the version that returns mock data
class MockABR {
    // in two places I had to break lines so the linter was happy
    private static xml = `<ABRPayloadSearchResults
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns="http://abr.business.gov.au/ABRXMLSearch/">
        <request>
        <nameSearchRequest>
        <authenticationGUID>cd30d8cc-3180-4afa-a16b-7faea008fa1c</authenticationGUID>
        <name>askowl</name>
        <filters>
        <nameType>
        <tradingName>Y</tradingName>
        <legalName>Y</legalName>
        </nameType>
        <postcode/>
        <stateCode>
        <QLD>Y</QLD>
        <NT>Y</NT>
        <SA>Y</SA>
        <WA>Y</WA>
        <VIC>Y</VIC>
        <ACT>Y</ACT>
        <TAS>Y</TAS>
        <NSW>Y</NSW>
        </stateCode>
        </filters>
        </nameSearchRequest>
        </request>
        <response>
        <usageStatement>
        The Registrar of the ABR monitors the quality of the
        information available on this website and updates the
        information regularly. However, neither the Registrar
        of the ABR nor the Commonwealth guarantee that the
        information available through this service (including
        search results) is accurate, up to date, complete or
        accept any liability arising from the use of or reliance 
        upon this site.
        </usageStatement>
        <dateRegisterLastUpdated>2016-07-26</dateRegisterLastUpdated>
        <dateTimeRetrieved>2016-07-26T16:10:45.3359657+10:00</dateTimeRetrieved>
        <searchResultsList>
        <numberOfRecords>5</numberOfRecords>
        <exceedsMaximum>N</exceedsMaximum>
        <searchResultsRecord>
        <ABN>
        <identifierValue>60008620406</identifierValue>
        <identifierStatus>Active</identifierStatus>
        </ABN>
        <mainName>
        <organisationName>ASKOWL PTY. LIMITED</organisationName>
        <score>100</score>
        <isCurrentIndicator>Y</isCurrentIndicator>
        </mainName>
        <mainBusinessPhysicalAddress>
        <stateCode>QLD</stateCode>
        <postcode>4061</postcode>
        <isCurrentIndicator>Y</isCurrentIndicator>
        </mainBusinessPhysicalAddress>
        </searchResultsRecord>
        <searchResultsRecord>
        <ABN>
        <identifierValue>84090455262</identifierValue>
        <identifierStatus>Cancelled</identifierStatus>
        </ABN>
        <mainName>
        <organisationName>ASHKOL PTY LTD</organisationName>
        <score>88</score>
        <isCurrentIndicator>Y</isCurrentIndicator>
        </mainName>
        <mainBusinessPhysicalAddress>
        <stateCode>NSW</stateCode>
        <postcode>2048</postcode>
        <isCurrentIndicator>Y</isCurrentIndicator>
        </mainBusinessPhysicalAddress>
        </searchResultsRecord>
        <searchResultsRecord>
        <ABN>
        <identifierValue>72010131450</identifierValue>
        <identifierStatus>Cancelled</identifierStatus>
        </ABN>
        <mainName>
        <organisationName>AUSKOOL PTY LTD</organisationName>
        <score>79</score>
        <isCurrentIndicator>Y</isCurrentIndicator>
        </mainName>
        <mainBusinessPhysicalAddress>
        <stateCode>QLD</stateCode>
        <postcode>4000</postcode>
        <isCurrentIndicator>Y</isCurrentIndicator>
        </mainBusinessPhysicalAddress>
        </searchResultsRecord>
        <searchResultsRecord>
        <ABN>
        <identifierValue>85136577109</identifierValue>
        <identifierStatus>Cancelled</identifierStatus>
        </ABN>
        <mainName>
        <organisationName>Auskoal Pty Ltd</organisationName>
        <score>79</score>
        <isCurrentIndicator>Y</isCurrentIndicator>
        </mainName>
        <mainBusinessPhysicalAddress>
        <stateCode>VIC</stateCode>
        <postcode>3072</postcode>
        <isCurrentIndicator>Y</isCurrentIndicator>
        </mainBusinessPhysicalAddress>
        </searchResultsRecord>
        <searchResultsRecord>
        <ABN>
        <identifierValue>11085772006</identifierValue>
        <identifierStatus>Active</identifierStatus>
        </ABN>
        <mainTradingName>
        <organisationName>AUSKOOL - COOL ROOM CONSTRUCTIONS</organisationName>
        <score>70</score>
        <isCurrentIndicator>Y</isCurrentIndicator>
        </mainTradingName>
        <mainBusinessPhysicalAddress>
        <stateCode>VIC</stateCode>
        <postcode>3140</postcode>
        <isCurrentIndicator>Y</isCurrentIndicator>
        </mainBusinessPhysicalAddress>
        </searchResultsRecord>
        </searchResultsList>
        </response>
        </ABRPayloadSearchResults>`;

    // returns one entry - since ABN is unique
    public static searchABN(abn:string):Promise<ABRentry> {
        return new Promise((resolve, reject) =>
            xml2js(this.xml, (err2:any, result:any) => {
                if (err2) { return reject(err2); }
                resolve([extractOrganisations(result)[0]]);
            }));
    }

    public static searchNames(name:string) {
        return new Promise((resolve, reject) =>
            xml2js(this.xml, (err2:any, result:any) => {
                if (err2) { return reject(err2); }
                resolve(extractOrganisations(result));
            }));
    }
}

// Mock data is used if the GUID is empty.
const useMock = !conf.abrAuthenticationGuid.length;

export const ABR = useMock ? MockABR : RealABR;
