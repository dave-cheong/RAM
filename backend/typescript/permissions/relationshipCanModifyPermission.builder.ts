import {PermissionBuilder} from '../models/base';
import {IPermission, Permission} from '../../../commons/dtos/permission.dto';
import {Url} from '../models/url';
import {Link} from '../../../commons/dtos/link.dto';
import {RelationshipCanModifyPermissionTemplate} from '../../../commons/permissions/relationshipPermission.templates';
import {IRelationship} from '../models/relationship.model';

export class RelationshipCanModifyPermissionBuilder extends PermissionBuilder<IRelationship> {

    constructor() {
        super(RelationshipCanModifyPermissionTemplate);
    }

    // todo this needs to check party access
    public async build(relationship: IRelationship): Promise<IPermission> {
        let permission = new Permission(this.template.code, this.template.description, this.template.value);
        permission.value = true;
        permission.link = new Link('modify', Url.PUT, await Url.forRelationship(relationship));
        return permission;
    }

}