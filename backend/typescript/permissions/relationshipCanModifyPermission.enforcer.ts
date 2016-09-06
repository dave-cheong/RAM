import {PermissionEnforcer} from '../models/base';
import {IPermission, Permission} from '../../../commons/dtos/permission.dto';
import {Url} from '../models/url';
import {Link} from '../../../commons/dtos/link.dto';
import {RelationshipCanModifyPermission} from '../../../commons/permissions/relationshipPermission.templates';
import {IRelationship} from '../models/relationship.model';
import {context} from '../providers/context.provider';
import {Translator} from '../ram/translator';

export class RelationshipCanModifyPermissionEnforcer extends PermissionEnforcer<IRelationship> {

    constructor() {
        super(RelationshipCanModifyPermission);
    }

    // todo this needs to check party access
    public async evaluate(relationship: IRelationship): Promise<IPermission> {

        let permission = new Permission(this.template.code, this.template.description, this.template.value);
        let authenticatedIdentity = context.getAuthenticatedPrincipal().identity;

        // validate authenticated
        if (!authenticatedIdentity) {
            permission.messages.push(Translator.get('security.notAuthenticated'));
        }

        // set value and link
        if (permission.messages.length === 0) {
            permission.value = true;
            permission.link = new Link('modify', Url.PUT, await Url.forRelationship(relationship));
        } else {
            permission.value = false;
        }

        return permission;

    }

}