import {PermissionEnforcer} from '../models/base';
import {IPermission, Permission} from '../../../commons/dtos/permission.dto';
import {Url} from '../models/url';
import {Link} from '../../../commons/dtos/link.dto';
import {RelationshipCanModifyPermission} from '../../../commons/permissions/relationshipPermission.templates';
import {IRelationship, RelationshipStatus} from '../models/relationship.model';
import {context} from '../providers/context.provider';
import {Translator} from '../ram/translator';
import {RelationshipTypeModel} from '../models/relationshipType.model';
import {Constants} from '../../../commons/constants';

export class RelationshipCanModifyPermissionEnforcer extends PermissionEnforcer<IRelationship> {

    constructor() {
        super(RelationshipCanModifyPermission);
    }

    // todo this needs to check party access
    public async evaluate(relationship: IRelationship): Promise<IPermission> {

        let permission = new Permission(this.template.code, this.template.description, this.template.value, this.template.linkType);
        let authenticatedIdentity = context.getAuthenticatedPrincipal().identity;
        let relationshipType = await RelationshipTypeModel.findByCodeIgnoringDateRange(relationship.relationshipType.code);
        let relationshipStatus = relationship.statusEnum();

        // validate authenticated
        if (!authenticatedIdentity) {
            permission.messages.push(Translator.get('security.notAuthenticated'));
        }

        // validate relationship type
        let manageExternallyIndAttributeUsage = relationshipType.findAttributeNameUsage(Constants.RelationshipAttributeNameCode.MANAGED_EXTERNALLY_IND);
        if (manageExternallyIndAttributeUsage) {
            permission.messages.push(Translator.get('relationship.modify.managedExternally'));
        }

        // validate status
        if (relationshipStatus !== RelationshipStatus.Pending && relationshipStatus !== RelationshipStatus.Accepted) {
            permission.messages.push(Translator.get('relationship.modify.invalidStatus'));
        }

        // set value and link
        if (permission.messages.length === 0) {
            permission.value = true;
            permission.link = new Link(permission.linkType, Url.PUT, await Url.forRelationship(relationship));
        } else {
            permission.value = false;
        }

        return permission;

    }

}