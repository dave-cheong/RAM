import {PermissionBuilder} from '../models/base';
import {IPermission, Permission} from '../../../commons/dtos/permission.dto';
import {Url} from '../models/url';
import {Link} from '../../../commons/dtos/link.dto';
import {RelationshipCanClaimPermissionTemplate} from '../../../commons/permissions/relationshipPermission.templates';
import {IRelationship} from '../models/relationship.model';

export class RelationshipCanClaimPermissionBuilder extends PermissionBuilder<IRelationship> {

    constructor() {
        super(RelationshipCanClaimPermissionTemplate);
    }

    // todo this needs to check party access
    // todo confirm the delegate is the user accepting
    // todo check identity strength
    public async build(relationship: IRelationship): Promise<IPermission> {
        let permission = new Permission(this.template.code, this.template.description, this.template.value);
        permission.value = await relationship.isPendingInvitation();
        if (permission.value) {
            permission.link = new Link('claim', Url.POST, await Url.forRelationshipClaim(relationship.invitationIdentity.rawIdValue));
        }
        return permission;
    }

}