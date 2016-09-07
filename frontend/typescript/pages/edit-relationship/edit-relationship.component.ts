import {Component, ChangeDetectorRef} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';
import {FormBuilder} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {Constants} from '../../../../commons/constants';
import {RAMServices} from '../../services/ram-services';

import {AccessPeriodComponent, AccessPeriodComponentData} from '../../components/access-period/access-period.component';
import {
    AuthorisationPermissionsComponent,
    AuthorisationPermissionsComponentData
} from '../../components/authorisation-permissions/authorisation-permissions.component';
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
    IIdentity,
    Identity,
    IRelationshipAttributeNameUsage,
    IRelationshipType,
    IRelationship,
    Relationship,
    Party,
    Profile,
    Name,
    SharedSecret,
    SharedSecretType,
    IHrefValue,
    HrefValue,
    IRelationshipAttribute,
    RelationshipAttribute,
    CodeDecode
} from '../../../../commons/api';

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

    private changeDetectorRef: ChangeDetectorRef;

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

    public originalStartDate: Date;

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
            isOrganisation: false,
            individual: {
                givenName: '',
                familyName: null,
                dob: null
            },
            organisation: {
                abn: '',
                organisationName: ''
            }
        },
        authorisationManagement: {
            value: 'false'
        },
        permissionAttributes: [],
        authorisationPermissions : {
            value: '',
            customisationEnabled: false,
            accessLevelsDescription: null,
            enabled: false
        },
        declaration: {
            accepted: false,
            markdown: 'TODO'
        }
    };

    constructor(route: ActivatedRoute, router: Router, fb: FormBuilder, services: RAMServices, cdr: ChangeDetectorRef) {
        super(route, router, fb, services);
        this.setBannerTitle('Authorisations');
        this.changeDetectorRef = cdr;
    }

    public onInit(params: {path: Params, query: Params}) {

        this.identityHref = params.path['identityHref'];
        this.relationshipHref = params.path['relationshipHref'];

        // relationship types
        this.services.rest.listRelationshipTypes().subscribe({
            next: this.onListRelationshipTypes.bind(this),
            error: this.onServerError.bind(this)
        });

        // identity in focus
        this.services.rest.findIdentityByHref(this.identityHref).subscribe({
            next: this.onFindIdentity.bind(this),
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

        // name, dob, abn
        const delegate = this.relationship.delegate.value;
        const isOrg = delegate.partyType === Constants.PartyTypeCode.ABN;
        const profile = delegate.identities[0].value.profile;
        // note - sharedsecrets are currently not returned - so the dob can not be populated!
        const dobSharedSecret = profile.getSharedSecret(Constants.SharedSecretCode.DATE_OF_BIRTH);

        this.relationshipComponentData.representativeDetails = {
            isOrganisation: isOrg,
                individual: {
                    givenName: isOrg ? '' : profile.name.givenName,
                    familyName: isOrg ? '' : profile.name.familyName,
                    dob: isOrg || !dobSharedSecret ? null : new Date(dobSharedSecret.value)
            },
            organisation: {
                abn: '',
                organisationName: ''
            }
        };

        // access period
        this.originalStartDate = relationship.startTimestamp;

        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);
        this.relationshipComponentData.accessPeriod = {
            startDate: relationship.startTimestamp,
            endDate: relationship.endTimestamp,
            noEndDate: relationship.endTimestamp === undefined || relationship.endTimestamp === null,
            startDateEnabled: this.originalStartDate > todayMidnight
        };

        // authorisation type
        // todo there may be a timing problem here - make sure reltypes are loaded
        const relationshipType = this.relationship.relationshipType.getFromList(this.relationshipTypeRefs);
        if (!relationshipType) {
            // todo probably Associate - what should we do?
            return;
        }
        this.relationshipComponentData.authType = {authType:relationshipType.code};

        // trigger authType change update before doing the rest
        this.changeDetectorRef.detectChanges();

        // auth management
        const userAuthorisedToManage = this.relationship.getAttribute(Constants.RelationshipAttributeNameCode.DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND).value[0];
        this.relationshipComponentData.authorisationManagement = {
            value: userAuthorisedToManage
        };

        // access levels
        let permAttributes = [];
        for (let att of this.relationship.attributes) {
            if (att.attributeName.value.classifier === Constants.RelationshipAttributeNameClassifier.PERMISSION) {
                if (!att.value) {
                    att.value = [];
                }
                permAttributes.push(att);
            }
        }
        this.relationshipComponentData.permissionAttributes = permAttributes;

        // tell angular we've changed things to please the checks that are done to confirm change propagation
        this.changeDetectorRef.detectChanges();

    }

    // todo refactor to use this
    public onNewRelationship() {

        // relationship
        this.relationship = new Relationship(
            null,
            null,
            new HrefValue(this.identity.party.href, null),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            Constants.RelationshipInitiatedBy.SUBJECT,
            null,
            []
        );

        this.originalStartDate = this.relationshipComponentData.accessPeriod.startDate;
    }

    public onListRelationshipTypes(relationshipTypeRefs: IHrefValue<IRelationshipType>[]) {
        // filter the relationship types to those that can be chosen here
        this.relationshipTypeRefs = relationshipTypeRefs.filter((relationshipType) => {
            return relationshipType.value.managedExternallyInd === false
                && relationshipType.value.category === Constants.RelationshipTypeCategory.AUTHORISATION;
        });
        this.resolveAttributeUsages();
    }

    public back() {
        this.services.route.goToRelationshipsPage(
            this.services.model.getLinkHrefByType(Constants.Link.SELF, this.identity)
        );
    }

    public submit() {

        // save
        if (!this.relationshipHref) {

            // insert relationship

            let partyType = this.relationshipComponentData.representativeDetails.isOrganisation ? Constants.PartyTypeCode.ABN : Constants.PartyTypeCode.INDIVIDUAL;
            let relationshipType = CodeDecode.getRefByCode(this.relationshipTypeRefs, this.relationshipComponentData.authType.authType) as IHrefValue<IRelationshipType>;

            // name
            let name = new Name(
                this.relationshipComponentData.representativeDetails.individual ? this.relationshipComponentData.representativeDetails.individual.givenName : undefined,
                this.relationshipComponentData.representativeDetails.individual ? this.relationshipComponentData.representativeDetails.individual.familyName : undefined,
                this.relationshipComponentData.representativeDetails.organisation ? this.relationshipComponentData.representativeDetails.organisation.organisationName : undefined,
                null
            );

            // dob
            let sharedSecrets: SharedSecret[] = [];
            if (this.relationshipComponentData.representativeDetails.individual) {
                let dob = this.relationshipComponentData.representativeDetails.individual.dob;
                if (dob) {
                    let dobSharedSecretType = new SharedSecretType(Constants.SharedSecretCode.DATE_OF_BIRTH, null, null, null, null, null);
                    sharedSecrets.push(new SharedSecret(dob.toString(), dobSharedSecretType));
                }
            }

            // profile
            let profile = new Profile(Constants.ProfileProviderCode.INVITATION, name, sharedSecrets);

            // identity
            let identityRef = new HrefValue<Identity>(null, new Identity(
                [],
                null,
                null,
                Constants.IdentityTypeCode.INVITATION_CODE,
                true,
                0,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                profile,
                null
            ));

            // delegate
            let delegateRef = new HrefValue(null, new Party(
                [],
                partyType,
                [identityRef]
            ));

            // meta
            this.relationship.relationshipType = relationshipType;
            this.relationship.delegate = delegateRef;
            this.relationship.startTimestamp = this.relationshipComponentData.accessPeriod.startDate;
            this.relationship.endTimestamp = this.relationshipComponentData.accessPeriod.endDate;
            this.relationship.endEventTimestamp = this.relationshipComponentData.accessPeriod.endDate;

            // delegate manage authorisation allowed attribute
            this.relationship.attributes = [
                new RelationshipAttribute(
                    [this.relationshipComponentData.authorisationManagement.value],
                    relationshipType.value.getAttributeNameRef(Constants.RelationshipAttributeNameCode.DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND)
                )
            ];

            // permission attributes
            if (relationshipType.value.getAttributeNameUsage(Constants.RelationshipAttributeNameCode.PERMISSION_CUSTOMISATION_ALLOWED_IND)) {
                for (let permissionAttribute of this.relationshipComponentData.permissionAttributes) {
                    this.relationship.attributes.push(permissionAttribute);
                }
            }

            // invoke api
            let saveHref = this.services.model.getLinkHrefByType(Constants.Link.RELATIONSHIP_CREATE, this.identity);
            this.services.rest.insertRelationshipByHref(saveHref, this.relationship).subscribe({
                next: this.onInsert.bind(this),
                error: this.onServerError.bind(this)
            });

        } else {

            // update relationship

            let relationshipType = CodeDecode.getRefByCode(this.relationshipTypeRefs, this.relationshipComponentData.authType.authType) as IHrefValue<IRelationshipType>;
            let firstIdentityForDelegate = this.relationship.delegate.value.identities[0];
            let profile = firstIdentityForDelegate.value.profile;
            let name = profile.name;

            // meta
            this.relationship.relationshipType = relationshipType;
            this.relationship.startTimestamp = this.relationshipComponentData.accessPeriod.startDate;
            this.relationship.endTimestamp = this.relationshipComponentData.accessPeriod.endDate;
            this.relationship.endEventTimestamp = this.relationshipComponentData.accessPeriod.endDate;

            // name
            name.givenName = this.relationshipComponentData.representativeDetails.individual ? this.relationshipComponentData.representativeDetails.individual.givenName : undefined;
            name.familyName = this.relationshipComponentData.representativeDetails.individual ? this.relationshipComponentData.representativeDetails.individual.familyName : undefined;
            name.unstructuredName = this.relationshipComponentData.representativeDetails.organisation ? this.relationshipComponentData.representativeDetails.organisation.organisationName : undefined;

            // dob
            if (this.relationshipComponentData.representativeDetails.individual) {
                let dob = this.relationshipComponentData.representativeDetails.individual.dob;
                if (dob) {
                    let dobSharedSecretType = new SharedSecretType(Constants.SharedSecretCode.DATE_OF_BIRTH, null, null, null, null, null);
                    profile.insertOrUpdateSharedSecret(new SharedSecret(dob.toString(), dobSharedSecretType));
                } else {
                    profile.deleteSharedSecret(Constants.SharedSecretCode.DATE_OF_BIRTH);
                }
            }

            // delegate manage authorisation allowed attribute
            this.relationship.deleteAttribute(Constants.RelationshipAttributeNameCode.DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND);
            this.relationship.attributes.push(new RelationshipAttribute(
                [this.relationshipComponentData.authorisationManagement.value],
                relationshipType.value.getAttributeNameRef(Constants.RelationshipAttributeNameCode.DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND)
            ));

            // permission attributes
            // todo this needs to replace any existing permissions
            if (relationshipType.value.getAttributeNameUsage(Constants.RelationshipAttributeNameCode.PERMISSION_CUSTOMISATION_ALLOWED_IND)) {
                for (let permissionAttribute of this.relationshipComponentData.permissionAttributes) {
                    this.relationship.attributes.push(permissionAttribute);
                }
            }

            // invoke api
            let saveHref = this.services.model.getLinkHrefByType(Constants.Link.MODIFY, this.relationship);
            this.services.rest.updateRelationshipByHref(saveHref, this.relationship).subscribe({
                next: this.onUpdate.bind(this),
                error: this.onServerError.bind(this)
            });

        }

    }

    public onInsert(relationship: IRelationship) {
        this.services.route.goToRelationshipAddCompletePage(
            this.identityHref,
            this.services.model.getLinkHrefByType(Constants.Link.SELF, relationship)
        );
    }

    public onUpdate(relationship: IRelationship) {
        this.services.route.goToRelationshipsPage(relationship.subject.value.identities[0].href);
    }

    public resolveAttributeUsages() {
        for (let relTypeRef of this.relationshipTypeRefs) {
            const attributeNames = relTypeRef.value.relationshipAttributeNames;
            this.permissionAttributeUsagesByType[relTypeRef.value.code] = attributeNames.filter((attName) => {
                return attName.attributeNameDef.value.classifier === Constants.RelationshipAttributeNameClassifier.PERMISSION;
            });
        }
    }

    public displayName(repDetails: RepresentativeDetailsComponentData) {
        if (repDetails.isOrganisation) {
            return repDetails.organisation.abn;
        } else {
            return repDetails.individual.givenName + (repDetails.individual.familyName ? ' ' + repDetails.individual.familyName : '');
        }
    }

    public authTypeChange = (data:AuthorisationTypeComponentData) => {

        // TODO calculate declaration markdown based on relationship type and services selected
        // TODO update declaration component to show new text
        this.relationshipComponentData.declaration.markdown = 'TODO ' + data.authType;

        // find the selected relationship type by code
        let selectedRelationshipTypeRef = CodeDecode.getRefByCode(this.relationshipTypeRefs, data.authType) as IHrefValue<IRelationshipType>;

        if (selectedRelationshipTypeRef) {

            const allowManageAuthorisationUsage = selectedRelationshipTypeRef.value.getAttributeNameUsage(Constants.RelationshipAttributeNameCode.DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND);
            const canChangeManageAuthorisationUsage = selectedRelationshipTypeRef.value.getAttributeNameUsage(Constants.RelationshipAttributeNameCode.DELEGATE_MANAGE_AUTHORISATION_USER_CONFIGURABLE_IND);

            this.manageAuthAttribute = allowManageAuthorisationUsage;

            // authorisation permission component
            this.relationshipComponentData.authorisationPermissions.customisationEnabled = selectedRelationshipTypeRef.value.getAttributeNameUsage(Constants.RelationshipAttributeNameCode.PERMISSION_CUSTOMISATION_ALLOWED_IND) !== null;
            this.relationshipComponentData.authorisationPermissions.enabled = true;
            this.relationshipComponentData.authorisationPermissions.accessLevelsDescription = selectedRelationshipTypeRef.value.getAttributeNameUsage(Constants.RelationshipAttributeNameCode.ACCESS_LEVELS_DESCRIPTION);

            // get the default value for the relationship type
            this.relationshipComponentData.authorisationManagement.value = allowManageAuthorisationUsage ? allowManageAuthorisationUsage.defaultValue : 'false';
            // allow editing of the value only if the DELEGATE_MANAGE_AUTHORISATION_USER_CONFIGURABLE_IND attribute is present on the relationship type
            this.disableAuthMgmt = canChangeManageAuthorisationUsage ? canChangeManageAuthorisationUsage === null : true;

            this.permissionAttributeUsages = this.permissionAttributeUsagesByType[selectedRelationshipTypeRef.value.code];

            // sort usages
            let orderedUsages = this.permissionAttributeUsages.slice();
            orderedUsages.sort((a, b) => {
                return a.sortOrder - b.sortOrder;
            });

            this.relationshipComponentData.permissionAttributes = [];
            for (let usage of orderedUsages) {
                let relationshipAttribute = new RelationshipAttribute(usage.defaultValue ? [usage.defaultValue] : [], usage.attributeNameDef);
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
    authorisationPermissions: AuthorisationPermissionsComponentData;
    permissionAttributes: IRelationshipAttribute[];
    declaration: DeclarationComponentData;
}