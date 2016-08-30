import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';
import {FormBuilder} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {RAMConstants} from '../../services/ram-constants.service';
import {RAMServices} from '../../services/ram-services';

import {AccessPeriodComponent, AccessPeriodComponentData} from '../../components/access-period/access-period.component';
import {AuthorisationPermissionsComponent} from '../../components/authorisation-permissions/authorisation-permissions.component';
import {
    AuthorisationTypeComponent,
    AuthorisationTypeComponentData
} from '../../components/authorisation-type/authorisation-type.component';
import {
    RelationshipDeclarationComponent, DeclarationComponentData
} from '../../components/relationship-declaration/relationship-declaration.component';
import {
    RepresentativeDetailsComponent, RepresentativeDetailsComponentData
} from
'../../components/representative-details/representative-details.component';
import {
    AuthorisationManagementComponent,
    AuthorisationManagementComponentData
} from '../../components/authorisation-management/authorisation-management.component';

import {
    IAttributeDTO,
    IIdentity,
    ICreateIdentityDTO,
    IInvitationCodeRelationshipAddDTO,
    IRelationshipAttributeNameUsage,
    IRelationshipType,
    IRelationship,
    IHrefValue,
    IRelationshipAttribute,
    RelationshipAttribute,
    CodeDecode
} from '../../../../commons/RamAPI';

@Component({
    selector: 'edit-relationship',
    templateUrl: 'edit-relationship.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        AccessPeriodComponent,
        AuthorisationPermissionsComponent,
        AuthorisationTypeComponent,
        RelationshipDeclarationComponent,
        RepresentativeDetailsComponent,
        AuthorisationManagementComponent,
        PageHeaderAuthComponent
    ]
})

export class EditRelationshipComponent extends AbstractPageComponent {

    public identityHref: string;
    public relationshipHref: string;

    public relationshipTypeRefs: IHrefValue<IRelationshipType>[];
    public permissionAttributeUsagesByType: { [relationshipTypeCode: string]: IRelationshipAttributeNameUsage[] } = {};
    public permissionAttributeUsages: IRelationshipAttributeNameUsage[];

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public identity: IIdentity;
    public relationship: IRelationship;
    public manageAuthAttribute: IRelationshipAttributeNameUsage;

    public authType: string = 'choose';
    public disableAuthMgmt: boolean = true;

    public relationshipComponentData: EditRelationshipComponentData = {
        accessPeriod: {
            startDateEnabled: true,
            startDate: new Date(),
            noEndDate: true,
            endDate: null
        },
        authType: {
            authType: 'choose'
        },
        representativeDetails: {
            individual: {
                givenName: '',
                familyName: null,
                dob: null
            },
            organisation: {
                abn: ''
            }
        },
        authorisationManagement: {
            value: 'false'
        },
        permissionAttributes: [],
        declaration: {
            accepted: false,
            markdown: 'TODO'
        }
    };

    constructor(route: ActivatedRoute, router: Router, fb: FormBuilder, services: RAMServices) {
        super(route, router, fb, services);
        this.setBannerTitle('Authorisations');
    }

    public onInit(params: {path: Params, query: Params}) {

        this.identityHref = params.path['identityHref'];
        this.relationshipHref = params.path['relationshipHref'];

        // identity in focus
        this.services.rest.findIdentityByHref(this.identityHref).subscribe({
            next: this.onFindIdentity.bind(this),
            error: this.onServerError.bind(this)
        });

        // relationship types
        this.services.rest.listRelationshipTypes().subscribe({
            next: this.onListRelationshipTypes.bind(this),
            error: this.onServerError.bind(this)
        });

    }

    public onFindIdentity(identity: IIdentity) {

        this.identity = identity;

        // relationship in focus
        if (this.relationshipHref) {
            this.services.rest.findRelationshipByHref(this.relationshipHref).subscribe({
                next: this.onFindRelationship.bind(this),
                error: this.onServerError.bind(this)
            });
        } else {
            this.onNewRelationship();
        }

    }

    // todo refactor to use this.relationship
    public onFindRelationship(relationship: IRelationship) {
        this.relationship = relationship;
    }

    // todo refactor to use this
    public onNewRelationship() {
    }

    public onListRelationshipTypes(relationshipTypeRefs: IHrefValue<IRelationshipType>[]) {
        // filter the relationship types to those that can be chosen here
        this.relationshipTypeRefs = relationshipTypeRefs.filter((relationshipType) => {
            return relationshipType.value.managedExternallyInd === false
                && relationshipType.value.category === RAMConstants.RelationshipTypeCategory.AUTHORISATION;
        });
        this.resolveAttributeUsages();
    }

    public back() {
        this.services.route.goToRelationshipsPage(
            this.services.model.getLinkHrefByType(RAMConstants.Link.SELF, this.identity)
        );
    }

    /* tslint:disable:max-func-body-length */
    public submit() {

        let delegate: ICreateIdentityDTO;

        if (this.relationshipComponentData.representativeDetails.individual) {
            const dob = this.relationshipComponentData.representativeDetails.individual.dob;
            delegate = {
                partyType: RAMConstants.PartyTypeCode.INDIVIDUAL,
                givenName: this.relationshipComponentData.representativeDetails.individual.givenName,
                familyName: this.relationshipComponentData.representativeDetails.individual.familyName,
                sharedSecretTypeCode: RAMConstants.SharedSecretCode.DATE_OF_BIRTH,
                sharedSecretValue: dob ? dob.toString() : ' ' /* TODO check format of date, currently sending x for space */,
                identityType: RAMConstants.IdentityTypeCode.INVITATION_CODE,
                agencyScheme: undefined,
                agencyToken: undefined,
                linkIdScheme: undefined,
                linkIdConsumer: undefined,
                publicIdentifierScheme: undefined,
                profileProvider: undefined,
            };
        } else {
            /* TODO handle organisation delegate */
            alert('NOT YET IMPLEMENTED!');
            //delegate = {
            //    partyType: 'ABN',
            //    unstructuredName: '' ,
            //    identityType: 'PUBLIC_IDENTIFIER',
            //    publicIdentifierScheme: 'ABN',
            //    agencyToken: this.relationshipComponentData.representativeDetails.organisation.abn // // TODO: where does the ABN value go?
            //};
        }

        const authorisationManagement: IAttributeDTO = {
            code: RAMConstants.RelationshipAttributeNameCode.DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND,
            value: this.relationshipComponentData.authorisationManagement.value
        };

        const relationship: IInvitationCodeRelationshipAddDTO = {
            relationshipType: this.relationshipComponentData.authType.authType,
            subjectIdValue: this.identity.idValue,
            delegate: delegate,
            startTimestamp: this.relationshipComponentData.accessPeriod.startDate,
            endTimestamp: this.relationshipComponentData.accessPeriod.endDate,
            attributes: [
                authorisationManagement
            ] /* TODO setting the attributes */
        };

        this.services.rest.createRelationship(relationship).subscribe((relationship) => {
            //console.log(JSON.stringify(relationship, null, 4));
            this.services.rest.findIdentityByHref(relationship.delegate.value.identities[0].href).subscribe((identity) => {
                //console.log(JSON.stringify(identity, null, 4));
                this.services.route.goToRelationshipAddCompletePage(
                    this.identity.idValue,
                    identity.rawIdValue,
                    this.displayName(this.relationshipComponentData.representativeDetails));
            }, (err) => {
                this.addGlobalErrorMessages(err);
            });
        }, (err) => {
            this.addGlobalErrorMessages(err);
        });

    }

    public resolveAttributeUsages() {
        for (let relTypeRef of this.relationshipTypeRefs) {
            const attributeNames = relTypeRef.value.relationshipAttributeNames;
            this.permissionAttributeUsagesByType[relTypeRef.value.code] = attributeNames.filter((attName) => {
                return attName.attributeNameDef.value.classifier === RAMConstants.RelationshipAttributeNameClassifier.PERMISSION;
            });
        }
    }

    public displayName(repDetails: RepresentativeDetailsComponentData) {
        if (repDetails.organisation) {
            return repDetails.organisation.abn;
        } else {
            return repDetails.individual.givenName + (repDetails.individual.familyName ? ' ' + repDetails.individual.familyName : '');
        }
    }

    public authTypeChange = (data:AuthorisationTypeComponentData) => {

        // TODO calculate declaration markdown based on relationship type and services selected
        // TODO update declaration component to show new text
        this.relationshipComponentData.declaration.markdown = 'TODO '+data.authType;

        // find the selected relationship type by code
        let selectedRelationshipTypeRef = CodeDecode.getRefByCode(this.relationshipTypeRefs, data.authType) as IHrefValue<IRelationshipType>;

        if (selectedRelationshipTypeRef) {

            const allowManageAuthorisationUsage = selectedRelationshipTypeRef.value.getAttributeNameUsage(RAMConstants.RelationshipAttributeNameCode.DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND);
            const canChangeManageAuthorisationUsage = selectedRelationshipTypeRef.value.getAttributeNameUsage(RAMConstants.RelationshipAttributeNameCode.DELEGATE_MANAGE_AUTHORISATION_USER_CONFIGURABLE_IND);

            this.manageAuthAttribute = allowManageAuthorisationUsage;

            // get the default value for the relationship type
            this.relationshipComponentData.authorisationManagement.value = allowManageAuthorisationUsage ? allowManageAuthorisationUsage.defaultValue : 'false';
            // allow editing of the value only if the DELEGATE_MANAGE_AUTHORISATION_USER_CONFIGURABLE_IND attribute is present on the relationship type
            this.disableAuthMgmt = canChangeManageAuthorisationUsage ? canChangeManageAuthorisationUsage===null : true;
            this.permissionAttributeUsages = this.permissionAttributeUsagesByType[selectedRelationshipTypeRef.value.code];
            this.relationshipComponentData.permissionAttributes = [];
            for (let usage of this.permissionAttributeUsages) {
                let relationshipAttribute = new RelationshipAttribute([usage.defaultValue], usage.attributeNameDef);
                this.relationshipComponentData.permissionAttributes.push(relationshipAttribute);
            }

        } else {
            this.disableAuthMgmt = true;
        }

    };

}

export interface EditRelationshipComponentData {
    accessPeriod: AccessPeriodComponentData;
    authType: AuthorisationTypeComponentData;
    representativeDetails: RepresentativeDetailsComponentData;
    authorisationManagement: AuthorisationManagementComponentData;
    permissionAttributes: IRelationshipAttribute[];
    declaration: DeclarationComponentData;
}