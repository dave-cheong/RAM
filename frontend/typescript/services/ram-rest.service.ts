/* tslint:disable:no-unused-variable */

import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {Response, Http, Headers} from '@angular/http';

import {RAMModelService} from './ram-model.service';

import {
    ISearchResult,
    IHrefValue,
    IPrincipal,
    IAgencyUser,
    IIdentity,
    IParty,
    IPartyType,
    IProfileProvider,
    IInvitationCodeRelationshipAddDTO,
    IRelationship,
    IRelationshipType,
    IRelationshipStatus,
    IRole,
    IRoleType,
    IRoleStatus,
    INotifyDelegateDTO,
    IAUSkey, RoleStatus, HrefValue
} from '../../../commons/RamAPI';
import {ABRentry} from '../../../commons/abr';

const assertHref = (href: string) => {
    if (!href) {
        throw new Error('Unable to contact the server as no href was provided.');
    }
};

class Href {

    constructor(private href: string) {
        assertHref(href);
    }

    public param(paramKey: string, paramValue: string|number|boolean, condition: boolean = true): Href {
        if (condition && paramValue !== undefined && paramValue !== null) {
            this.href += this.href.indexOf('?') === -1 ? '?' : '&';
            this.href += paramKey + '=' + paramValue;
        }
        return this;
    }

    public toString(): string {
        return this.href;
    }

}

@Injectable()
export class RAMRestService {

    constructor(private http: Http,
                private modelService: RAMModelService) {
    }

    // auskey ...........................................................................................................

    public searchAusKeysByHref(href: string, filter: string, page: number): Observable<ISearchResult<IHrefValue<IAUSkey>>> {
        return this.http
            .get(new Href(href).param('filter', filter).param('page', page).toString())
            .map(this.extractDataDeprecated);
    }

    // misc ...........................................................................................................

    /*
     * Old interface used when adding a business relationship. Now
     * delegates to the ABR for the real work.
     */
    public getOrganisationNameFromABN(abn: string) {
        return this.getABRfromABN(abn).map((abr: ABRentry) => abr.name);
    }

    /*
     * This goes out to the ABR (external source) and returns with
     * limited company data for a single organisation - or an 404
     * if the abn doesn't exist.
     */
    public getABRfromABN(abn: string) {
        return this.http
            .get(`/api/v1/business/abn/` + abn)
            .map(this.extractDataDeprecated);
    }

    /*
     * This goes out to the ABR (external source) and returns with
     * limited company data for a many organisations. Not sure if the
     * name doesn't match anything because I could not find one :)
     */
    public getABRfromName(name: string) {
        return this.http
            .get(`/api/v1/business/name/` + name)
            .map(this.extractDataDeprecated);
    }

    /*
     * This is RAM internal to create identity and party records
     * (if needed) for an organisation of interest retrieved
     * from the ABR.
     */
    public registerABRCompany(abr: ABRentry): Observable<IIdentity> {
        return this.http
            .get(`/api/v1/business/register/` + abr.abn + '/' + abr.name)
            .map(this.extractDataDeprecated);
    }

    // principal ......................................................................................................

    public findMyPrincipal(): Observable<IPrincipal> {
        return this.http
            .get(`/api/v1/me`)
            .map(this.extractDataDeprecated);
    }

    // agency user ....................................................................................................

    public findMyAgencyUser(): Observable<IAgencyUser> {
        return this.http
            .get(`/api/v1/agencyUser/me`)
            .map(this.extractDataDeprecated);
    }

    // party ..........................................................................................................

    public findPartyByABN(abn: string): Observable<IParty> {
        const idValue = `PUBLIC_IDENTIFIER:ABN:${abn}`;
        return this.http
            .get(`/api/v1/party/identity/${idValue}`)
            .map(this.extractDataDeprecated);
    }

    // identity .......................................................................................................

    public findMyIdentity(): Observable<IIdentity> {
        return this.http
            .get(`/api/v1/identity/me`)
            .map(this.extractDataDeprecated);
    }

    public findIdentityByValue(identityValue: string): Observable<IIdentity> {
        return this.http
            .get(`/api/v1/identity/${identityValue}`)
            .map(this.extractDataDeprecated);
    }

    public findIdentityByHref(href: string): Observable<IIdentity> {
        return this.http
            .get(new Href(href).toString())
            .map(this.extractDataDeprecated);
    }

    // party type .....................................................................................................

    public listPartyTypes(): Observable<IHrefValue<IPartyType>[]> {
        return this.http
            .get('/api/v1/partyTypes')
            .map(this.extractDataDeprecated);
    }

    // profile provider ...............................................................................................

    public listProfileProviders(): Observable<IHrefValue<IProfileProvider>[]> {
        return this.http
            .get('/api/v1/profileProviders')
            .map(this.extractDataDeprecated);
    }

    // relationship ...................................................................................................

    public listRelationshipStatuses(): Observable<IHrefValue<IRelationshipStatus>[]> {
        return this.http
            .get('/api/v1/relationshipStatuses')
            .map(this.extractDataDeprecated);
    }

    public searchDistinctSubjectsForMe(filter: string,
                                       page: number): Observable<ISearchResult<IHrefValue<IParty>>> {
        return this.http
            .get(`/api/v1/relationships/identity/subjects?filter=${filter}&page=${page}`)
            .map(this.extractDataDeprecated);
    }

    public searchRelationshipsByIdentity(idValue: string,
                                         filter: string,
                                         page: number): Observable<ISearchResult<IHrefValue<IRelationship>>> {
        return this.http
            .get(`/api/v1/relationships/identity/${idValue}?filter=${filter}&page=${page}`)
            .map(this.extractDataDeprecated);
    }

    public searchDistinctSubjectsBySubjectOrDelegateIdentity(idValue: string,
                                                             page: number): Observable<ISearchResult<IHrefValue<IParty>>> {
        return this.http
            .get(`/api/v1/relationships/identity/${idValue}/subjects?page=${page}`)
            .map(this.extractDataDeprecated);
    }

    public claimRelationshipByInvitationCode(invitationCode: string): Observable<IRelationship> {
        return this.http
            .post(`/api/v1/relationship/invitationCode/${invitationCode}/claim`, '')
            .map(this.extractDataDeprecated);
    }

    public findRelationshipByHref(href: string): Observable<IRelationship> {
        return this.http
            .get(new Href(href).toString())
            .map(this.extractDataDeprecated);
    }

    public findPendingRelationshipByInvitationCode(invitationCode: string): Observable<IRelationship> {
        return this.http
            .get(`/api/v1/relationship/invitationCode/${invitationCode}`)
            .map(this.extractDataDeprecated);
    }

    public acceptPendingRelationshipByInvitationCode(relationship: IRelationship): Observable<IRelationship> {
        return this.http
            .post(this.modelService.getLinkHrefByType('accept', relationship), '')
            .map(this.extractDataDeprecated);
    }

    public rejectPendingRelationshipByInvitationCode(relationship: IRelationship): Observable<IRelationship> {
        return this.http
            .post(this.modelService.getLinkHrefByType('reject', relationship), '')
            .map(this.extractDataDeprecated);
    }

    public notifyDelegateByInvitationCode(invitationCode: string, notification: INotifyDelegateDTO): Observable<IRelationship> {
        return this.http
            .post(`/api/v1/relationship/invitationCode/${invitationCode}/notifyDelegate`, JSON.stringify(notification), {
                headers: this.headersForJson()
            })
            .map(this.extractDataDeprecated);
    }

    public createRelationship(relationship: IInvitationCodeRelationshipAddDTO): Observable<IRelationship> {
        return this.http
            .post(`/api/v1/relationship-by-invitation`, JSON.stringify(relationship), {
                headers: this.headersForJson()
            })
            .map(this.extractDataDeprecated);
    }

    public insertRelationshipByHref(href: string, relationship: IRelationship): Observable<IRelationship> {
        return this.http
            .post(new Href(href).toString(), JSON.stringify(relationship), {
                headers: this.headersForJson()
            })
            .map(this.extractDataDeprecated);
    }

    public updateRelationshipByHref(href: string, relationship: IRelationship): Observable<IRelationship> {
        return this.http
            .put(new Href(href).toString(), JSON.stringify(relationship), {
                headers: this.headersForJson()
            })
            .map(this.extractDataDeprecated);
    }

    // relationship type ..............................................................................................

    public findRelationshipTypeByCode(code: string): Observable<IRelationshipType> {
        return this.http
            .get(`/api/v1/relationshipType/${code}`)
            .map(this.extractDataDeprecated);
    }

    public findRelationshipTypeByHref(href: string): Observable<IRelationshipType> {
        return this.http
            .get(new Href(href).toString())
            .map(this.extractDataDeprecated);
    }

    public listRelationshipTypes(): Observable<IHrefValue<IRelationshipType>[]> {
        return this.http
            .get('/api/v1/relationshipTypes')
            .map(this.extractDataDeprecated);
    }

    // role ...........................................................................................................

    public searchRolesByHref(href: string,
                             filter: string,
                             page: number): Observable<ISearchResult<IHrefValue<IRole>>> {
        return this.http
            .get(new Href(href).param('filter', filter).param('page', page).toString())
            .map(this.extractDataDeprecated);
    }

    public findRoleByHref(href: string): Observable<IRole> {
        return this.http
            .get(new Href(href).toString())
            .map(this.extractDataDeprecated);
    }

    public findRoleTypeByHref(href: string): Observable<IRoleType> {
        return this.http
            .get(new Href(href).toString())
            .map(this.extractDataDeprecated);
    }

    public createRole(role: IRole): Observable<IRole> {
        return this.http
            .post(`/api/v1/role`, JSON.stringify(role), {
                headers: this.headersForJson()
            })
            .map(this.extractDataDeprecated);
    }

    public insertRoleByHref(href: string, role: IRole): Observable<IRole> {
        return this.http
            .post(new Href(href).toString(), JSON.stringify(role), {
                headers: this.headersForJson()
            })
            .map(this.extractDataDeprecated);
    }

    public updateRoleByHref(href: string, role: IRole): Observable<IRole> {
        return this.http
            .put(new Href(href).toString(), JSON.stringify(role), {
                headers: this.headersForJson()
            })
            .map(this.extractDataDeprecated);
    }

    // role status ....................................................................................................

    public listRoleStatuses(): Observable<IHrefValue<IRoleStatus>[]> {
        return this.http
            .get('/api/v1/roleStatuses')
            .map(this.extractDataHrefValue(RoleStatus));
    }

    // role type ......................................................................................................

    public listRoleTypes(): Observable<IHrefValue<IRoleType>[]> {
        return this.http
            .get('/api/v1/roleTypes')
            .map(this.extractDataDeprecated);
    }

    // misc ...........................................................................................................

    public extractErrorMessages(response: Response): string[] {
        const json = response.json();
        if (json && json.alert && json.alert.messages) {
            return json.alert.messages;
        }
        return ['An unknown error has occurred.'];
    }

    private headersForJson() {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return headers;
    }

    // todo the be removed
    private extractDataDeprecated(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Status code is:' + res.status);
        }
        const convertExtractedData = (object: Object) => {
            if (object) {
                for (let key of Object.keys(object)) {
                    let value = object[key];
                    if (key === 'timestamp' || key.indexOf('Timestamp') !== -1 || key.endsWith('At')) {
                        if (value) {
                            object[key] = new Date(value);
                            // console.log('converting string to date value: ', value, object[key]);
                        }
                    } else if (typeof value === 'object') {
                        convertExtractedData(value);
                    }
                }
            }
        };
        let payload = res.json() || {};
        convertExtractedData(payload);
        return payload;
    }

    private extractDataHrefValue(targetClass) {
        return (res: Response) => {
            if (res.status < 200 || res.status >= 300) {
                throw new Error('Status code is:' + res.status);
            }
            let payload = res.json() || {};
            if (Array.isArray(payload)) {
                const result: any[] = [];
                for (let payloadElement of payload) {
                    const hrefValueObject = Object.create(HrefValue.prototype);
                    hrefValueObject.build(payloadElement, targetClass);
                    result.push(hrefValueObject);
                }
                return result;
            } else {
                const hrefValueObject = Object.create(HrefValue.prototype);
                hrefValueObject.build(payload, targetClass);
                return hrefValueObject;
            }
        };
    }

    private extractData(targetClass) {
        return (res: Response) => {
            if (res.status < 200 || res.status >= 300) {
                throw new Error('Status code is:' + res.status);
            }
            let payload = res.json() || {};
            if (Array.isArray(payload)) {
                const result: any[] = [];
                for (let payloadElement of payload) {
                    const targetObject = Object.create(targetClass.prototype);
                    targetObject.build(payloadElement);
                    result.push(targetObject);
                }
                return result;
            } else {
                const targetObject = Object.create(targetClass.prototype);
                targetObject.build(payload);
                return targetObject;
            }
        };
    }

}