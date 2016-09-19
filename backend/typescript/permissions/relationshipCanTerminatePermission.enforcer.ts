import {PermissionEnforcer} from '../models/base';
import {IPermission, Permission} from '../../../commons/dtos/permission.dto';
import {Url} from '../models/url';
import {Link} from '../../../commons/dtos/link.dto';
import {RelationshipCanTerminatePermission} from '../../../commons/permissions/relationshipPermission.templates';
import {IRelationship, RelationshipStatus} from '../models/relationship.model';
import {context} from '../providers/context.provider';
import {Translator} from '../ram/translator';
import {IdentityModel} from '../models/identity.model';
import {PartyModel} from '../models/party.model';
import {Constants} from '../../../commons/constants';

export class RelationshipCanTerminatePermissionEnforcer extends PermissionEnforcer<IRelationship> {

    constructor() {
        super(RelationshipCanTerminatePermission);
    }

    public async evaluate(relationship: IRelationship): Promise<IPermission> {

        let permission = new Permission(this.template.code, this.template.description, this.template.value, this.template.linkType);
        let authenticatedPrincipal = context.getAuthenticatedPrincipal();

        // validate authenticated
        if (!authenticatedPrincipal) {
            permission.messages.push(Translator.get('security.notAuthenticated'));
        }

        // validate relationship status
        if (relationship.statusEnum() !== RelationshipStatus.Accepted) {
            permission.messages.push(Translator.get('relationship.terminate.notAccepted'));
        }

        // validate managed externally
        let managedExternallyAttribute = await relationship.getAttribute(Constants.RelationshipAttributeNameCode.MANAGED_EXTERNALLY_IND);
        if (managedExternallyAttribute) {
            permission.messages.push(Translator.get('relationship.terminate.managedExternally'));
        }

        // validate has access to subject
        let subjectDefaultIdentity = await IdentityModel.findDefaultByPartyId(relationship.subject.id);
        let hasAccessToSubject = PartyModel.hasAccess(subjectDefaultIdentity.idValue, context.getAuthenticatedPrincipal());
        if (!hasAccessToSubject) {
            permission.messages.push(Translator.get('security.noAccess'));
        }

        // validate has access to delegate
        let delegateDefaultIdentity = await IdentityModel.findDefaultByPartyId(relationship.delegate.id);
        let hasAccessToDelegate = PartyModel.hasAccess(delegateDefaultIdentity.idValue, context.getAuthenticatedPrincipal());
        if (!hasAccessToDelegate) {
            permission.messages.push(Translator.get('security.noAccess'));
        }

        // set value and link
        if (permission.messages.length === 0) {
            permission.value = true;
            permission.link = new Link(permission.linkType, Url.PUT, await Url.forRelationshipTerminate(relationship));
        } else {
            permission.value = false;
        }

        return permission;

    }

}