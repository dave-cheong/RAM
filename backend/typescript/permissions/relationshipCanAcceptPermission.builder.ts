import {PermissionBuilder} from '../models/base';
import {IPermission, Permission} from '../../../commons/dtos/permission.dto';
import {Url} from '../models/url';
import {Link} from '../../../commons/dtos/link.dto';
import {RelationshipCanAcceptPermissionTemplate} from '../../../commons/permissions/relationshipPermission.templates';
import {IRelationship, RelationshipStatus} from '../models/relationship.model';
import {context} from '../providers/context.provider';

export class RelationshipCanAcceptPermissionBuilder extends PermissionBuilder<IRelationship> {

    constructor() {
        super(RelationshipCanAcceptPermissionTemplate);
    }

    // todo this needs to check party access
    // todo confirm the delegate is the user accepting
    // todo check identity strength
    public async build(relationship: IRelationship): Promise<IPermission> {
        let permission = new Permission(this.template.code, this.template.description, this.template.value);
        permission.value = await relationship.isPendingInvitation() && this.canAccept(relationship);
        if (permission.value) {
            permission.link = new Link('accept', Url.POST, await Url.forRelationshipAccept(relationship.invitationIdentity.rawIdValue));
        }
        return permission;
    }

    private canAccept(relationship: IRelationship): boolean {
        const acceptingDelegateIdentity = context.getAuthenticatedPrincipal().identity;
        return (
            relationship.statusEnum() === RelationshipStatus.Pending
            && acceptingDelegateIdentity.party.id === relationship.delegate.id
            && acceptingDelegateIdentity.strength >= relationship.relationshipType.minIdentityStrength
        );
    }

}