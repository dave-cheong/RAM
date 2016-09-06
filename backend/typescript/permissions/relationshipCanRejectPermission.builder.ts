import {PermissionBuilder} from '../models/base';
import {IPermission, Permission} from '../../../commons/dtos/permission.dto';
import {Url} from '../models/url';
import {Link} from '../../../commons/dtos/link.dto';
import {RelationshipCanRejectPermissionTemplate} from '../../../commons/permissions/relationshipPermission.templates';
import {IRelationship, RelationshipStatus} from '../models/relationship.model';
import {Translator} from '../ram/translator';
import {context} from '../providers/context.provider';

export class RelationshipCanRejectPermissionBuilder extends PermissionBuilder<IRelationship> {

    constructor() {
        super(RelationshipCanRejectPermissionTemplate);
    }

    // todo this needs to check party access
    // todo confirm the delegate is the user accepting
    // todo check identity strength
    public async build(relationship: IRelationship): Promise<IPermission> {

        let permission = new Permission(this.template.code, this.template.description, this.template.value);
        let authenticatedIdentity = context.getAuthenticatedPrincipal().identity;

        // validate authenticated
        if (!authenticatedIdentity) {
            permission.messages.push(Translator.get('security.notAuthenticated'));
        }

        // validate relationship status
        if (relationship.statusEnum() !== RelationshipStatus.Pending) {
            permission.messages.push(Translator.get('relationship.reject.notPending'));
        }

        // set value and link
        if (permission.messages.length === 0) {
            permission.value = true;
            permission.link = new Link('reject', Url.POST, await Url.forRelationshipReject(relationship.invitationIdentity.rawIdValue));
        } else {
            permission.value = false;
        }

        return permission;

    }

}