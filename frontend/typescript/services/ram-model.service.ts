//
// todo deprecate this, as these helpers should now be defined in the DTOs themselves
//

import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';

import {
    ILink,
    IHasLinks,
    IHrefValue,
    IName,
    IParty,
    IProfileProvider,
    IIdentity,
    IRelationship,
    IRelationshipStatus,
    IRelationshipType,
    IRole,
    IRoleStatus,
    IRoleType,
    IRoleAttributeNameUsage,
    IRoleAttributeName,
    IRelationshipAttributeName,
    IRelationshipAttributeNameUsage,
    IRoleAttribute,
    IRelationshipAttribute
} from '../../../commons/api';

@Injectable()
export class RAMModelService {

    // helpers ........................................................................................................

    public displayDate(dateString: string): string {
        if (dateString) {
            const date = new Date(dateString);
            const datePipe = new DatePipe();
            return datePipe.transform(date, 'd') + ' ' +
                datePipe.transform(date, 'MMMM') + ' ' +
                datePipe.transform(date, 'yyyy');
        }
        return 'Not specified';
    }

    public displayName(name: IName): string {
        if (name) {
            return name._displayName;
        }
        return '';
    }

    public displayNameForParty(party: IParty): string {
        const resource = this.getDefaultIdentityResource(party);
        return resource ? this.displayName(resource.value.profile.name) : '';
    }

    public displayNameForIdentity(identity: IIdentity): string {
        return identity ? this.displayName(identity.profile.name) : '';
    }

    public abnLabelForParty(party: IParty): string {
        let abn = this.abnForParty(party);
        return abn ? 'ABN ' + abn : null;
    }

    public abnForParty(party: IParty): string {
        if (party && party.identities && party.identities.length > 0) {
            for (const resource of party.identities) {
                const identity = resource.value;
                if (identity.identityType === 'PUBLIC_IDENTIFIER' && identity.publicIdentifierScheme === 'ABN') {
                    return identity.rawIdValue;
                }
            }
            return null;
        }
        return null;
    }

    public partyTypeLabelForParty(party: IParty): string {
        const partyType = party.partyType;
        if (partyType === 'INDIVIDUAL') {
            return 'Individual';
        } else {
            return 'Organisation';
        }
    }

    public isIndividual(identity: IIdentity): boolean {
        return identity && identity.identityType === 'LINK_ID';
    }

    public profileProviderLabel(profileProviderRefs: IHrefValue<IProfileProvider>[], code: string): string {
        const profileProvider = this.getProfileProvider(profileProviderRefs, code);
        return profileProvider ? profileProvider.shortDecodeText : '';
    }

    public relationshipTypeLabel(relationshipTypeRefs: IHrefValue<IRelationshipType>[], relationship: IRelationship): string {
        if (relationshipTypeRefs && relationship) {
            let relationshipType = this.getRelationshipType(relationshipTypeRefs, relationship);
            if (relationshipType) {
                return relationshipType.shortDecodeText;
            }
        }
        return '';
    }

    public roleTypeLabel(roleTypeRefs: IHrefValue<IRoleType>[], role: IRole): string {
        if (roleTypeRefs && role) {
            let roleType = this.getRoleType(roleTypeRefs, role);
            if (roleType) {
                return roleType.shortDecodeText;
            }
        }
        return '';
    }

    public relationshipStatusLabel(relationshipStatusRefs: IHrefValue<IRelationshipStatus>[], code: string): string {
        const status = this.getRelationshipStatus(relationshipStatusRefs, code);
        return status ? status.shortDecodeText : '';
    }

    public roleStatusLabel(roleStatusRefs: IHrefValue<IRoleStatus>[], code: string): string {
        const status = this.getRoleStatus(roleStatusRefs, code);
        return status ? status.shortDecodeText : '';
    }

    public roleAttributeLabel(role: IRole, code: string): string[] {
        for (let attribute of role.attributes) {
            if (attribute.attributeName.value.code === code) {
                return attribute.value;
            }
        }
        return [];
    }

    // model lookups ..................................................................................................

    public hasLinkHrefByType(type: string, model: IHasLinks): boolean {
        let link = this.getLinkByType(type, model);
        return link && link.href !== null && link.href !== undefined;
    }

    public getLinkHrefByType(type: string, model: IHasLinks): string {
        let link = this.getLinkByType(type, model);
        return link ? link.href : null;
    }

    public getLinkByType(type: string, model: IHasLinks): ILink {
        if (type && model && model._links) {
            for (let link of model._links) {
                if (link.type === type) {
                    return link;
                }
            }
        }
        return null;
    }

    public getDefaultIdentityResource(party: IParty): IHrefValue<IIdentity> {
        if (party && party.identities && party.identities.length > 0) {
            for (let ref of party.identities) {
                const identity = ref.value;
                if (identity.defaultInd) {
                    return ref;
                }
            }
        }
        return null;
    }

    public getProfileProvider(profileProviderRefs: IHrefValue<IProfileProvider>[], code: string): IProfileProvider {
        if (profileProviderRefs && code) {
            for (let ref of profileProviderRefs) {
                if (ref.value.code === code) {
                    return ref.value;
                }
            }
        }
        return null;
    }

    public getRelationshipType(relationshipTypeRefs: IHrefValue<IRelationshipType>[], relationship: IRelationship): IRelationshipType {
        if (relationshipTypeRefs && relationship) {
            let href = relationship.relationshipType.href;
            for (let ref of relationshipTypeRefs) {
                if (ref.href === href) {
                    return ref.value;
                }
            }
        }
        return null;
    }

    public getRelationshipTypeByCode(relationshipTypeRefs: IHrefValue<IRelationshipType>[], code:string): IHrefValue<IRelationshipType> {
        if (relationshipTypeRefs && code) {
            for (let ref of relationshipTypeRefs) {
                if (ref.value.code === code) {
                    return ref;
                }
            }
        }
        return null;
    }

    public getRoleType(roleTypeRefs: IHrefValue<IRoleType>[], role: IRole): IRoleType {
        if (roleTypeRefs && role) {
            let href = role.roleType.href;
            for (let ref of roleTypeRefs) {
                if (ref.href === href) {
                    return ref.value;
                }
            }
        }
        return null;
    }

    public getRelationshipStatus(relationshipStatusRefs: IHrefValue<IRelationshipStatus>[], code: string): IRelationshipStatus {
        if (relationshipStatusRefs) {
            for (let ref of relationshipStatusRefs) {
                if (ref.value.code === code) {
                    return ref.value;
                }
            }
        }
        return null;
    }

    public getRoleStatus(roleStatusRefs: IHrefValue<IRoleStatus>[], code: string): IRoleStatus {
        if (roleStatusRefs) {
            for (let ref of roleStatusRefs) {
                if (ref.value.code === code) {
                    return ref.value;
                }
            }
        }
        return null;
    }

    public getRelationshipAttribute(relationshipRef: IRelationship, code: string, classifier: string): IRelationshipAttribute {
        for (let attr of relationshipRef.attributes) {
            const attributeNameRef = attr.attributeName;
            if (attributeNameRef.value.code === code) {
                if(!classifier || classifier === attributeNameRef.value.classifier) {
                    return attr;
                }
            }
        }
        return null;
    }

    public getRelationshipTypeAttributeNameRef(relationshipTypeRef: IHrefValue<IRelationshipType>, code: string): IHrefValue<IRelationshipAttributeName> {
        for (let usage of relationshipTypeRef.value.relationshipAttributeNames) {
            const attributeNameRef = usage.attributeNameDef;
            if (attributeNameRef.value.code === code) {
                return attributeNameRef;
            }
        }
        return null;
    }

    public getRelationshipTypeAttributeNameUsage(relationshipTypeRef: IHrefValue<IRelationshipType>, code: string): IRelationshipAttributeNameUsage {
        for (let usage of relationshipTypeRef.value.relationshipAttributeNames) {
            const attributeNameRef = usage.attributeNameDef;
            if (attributeNameRef.value.code === code) {
                return usage;
            }
        }
        return null;
    }

    public getAllAgencyServiceRoleAttributeNameUsages(roleTypeRef: IHrefValue<IRoleType>, programs: string[]): IRoleAttributeNameUsage[] {
        let agencyServiceRoleAttributeNameUsages: IRoleAttributeNameUsage[] = [];
        if (roleTypeRef) {
            for (let roleAttributeNameUsage of roleTypeRef.value.roleAttributeNames) {
                let classifier = roleAttributeNameUsage.attributeNameDef.value.classifier;
                if (classifier === 'AGENCY_SERVICE') {
                    agencyServiceRoleAttributeNameUsages.push(roleAttributeNameUsage);
                }
            }
        }
        return agencyServiceRoleAttributeNameUsages;
    }

    public getAccessibleAgencyServiceRoleAttributeNameUsages(roleTypeRef: IHrefValue<IRoleType>, programs: string[]): IRoleAttributeNameUsage[] {
        let agencyServiceRoleAttributeNameUsages: IRoleAttributeNameUsage[] = [];
        if (roleTypeRef) {
            for (let roleAttributeNameUsage of roleTypeRef.value.roleAttributeNames) {
                let classifier = roleAttributeNameUsage.attributeNameDef.value.classifier;
                if (classifier === 'AGENCY_SERVICE') {
                    let category = roleAttributeNameUsage.attributeNameDef.value.category;
                    if (category && (!programs || programs.length === 0 || programs.indexOf(category) !== -1)) {
                        agencyServiceRoleAttributeNameUsages.push(roleAttributeNameUsage);
                    }
                }
            }
        }
        return agencyServiceRoleAttributeNameUsages;
    }

    public getAccessibleAgencyServiceRoleAttributeNames(roleRef: IHrefValue<IRole>, programs: string[]): IRoleAttributeName[] {
        let agencyServiceRoleAttributeNames: IRoleAttributeName[] = [];
        if (roleRef) {
            for (let roleAttribute of roleRef.value.attributes) {
                let classifier = roleAttribute.attributeName.value.classifier;
                if (classifier === 'AGENCY_SERVICE') {
                    let category = roleAttribute.attributeName.value.category;
                    if (category && (!programs || programs.length === 0 || programs.indexOf(category) !== -1)) {
                        agencyServiceRoleAttributeNames.push(roleAttribute.attributeName.value);
                    }
                }
            }
        }
        return agencyServiceRoleAttributeNames;
    }

    public getRoleTypeRef(roleTypeRefs: IHrefValue<IRoleType>[], code: string): IHrefValue<IRoleType> {
        for (let ref of roleTypeRefs) {
            if (ref.value.code === code) {
                return ref;
            }
        }
        return null;
    }

    public getRoleTypeAttributeNameRef(roleTypeRef: IHrefValue<IRoleType>, code: string): IHrefValue<IRoleAttributeName> {
        for (let usage of roleTypeRef.value.roleAttributeNames) {
            const attributeNameRef = usage.attributeNameDef;
            if (attributeNameRef.value.code === code) {
                return attributeNameRef;
            }
        }
        return null;
    }

    public getRoleAttribute(roleRef: IRole, code: string, classifier: string): IRoleAttribute {
        for (let attr of roleRef.attributes) {
            const attributeNameRef = attr.attributeName;
            if (attributeNameRef.value.code === code) {
                if(!classifier || classifier === attributeNameRef.value.classifier) {
                    return attr;
                }
            }
        }
        return null;
    }

    public getRoleAttributesByClassifier(roleRef: IRole, classifier: string): IRoleAttribute[] {
        const values: IRoleAttribute[] = [];

        for (let attr of roleRef.attributes) {
            const attributeNameRef = attr.attributeName;
            if (attributeNameRef.value.classifier === classifier) {
                values.push(attr);
            }
        }
        return values;
    }

    public getRoleAttributeValue(attribute: IRoleAttribute): string | string[] {
        if(attribute) {
            if(attribute.attributeName.value.domain === 'SELECT_MULTI') {
                return attribute.value;
            }
            if(attribute.value) {
                return attribute.value[0];
            }
        }
        return null;
    }
}
