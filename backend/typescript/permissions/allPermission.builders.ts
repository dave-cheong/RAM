import {IPermissionBuilder} from '../models/base';
import {IRelationship} from '../models/relationship.model';

import {RelationshipCanAcceptPermissionBuilder} from './relationshipCanAcceptPermission.builder';
import {RelationshipCanClaimPermissionBuilder} from './relationshipCanClaimPermission.builder';
import {RelationshipCanModifyPermissionBuilder} from './relationshipCanModifyPermission.builder';
import {RelationshipCanNotifyDelegatePermissionBuilder} from './relationshipCanNotifyDelegatePermission.builder';
import {RelationshipCanRejectPermissionBuilder} from './relationshipCanRejectPermission.builder';
import {RelationshipCanViewPermissionBuilder} from './relationshipCanViewPermission.builder';

export class PermissionBuilders {

    public static relationship: IPermissionBuilder<IRelationship>[] = [
        new RelationshipCanAcceptPermissionBuilder(),
        new RelationshipCanClaimPermissionBuilder(),
        new RelationshipCanModifyPermissionBuilder(),
        new RelationshipCanNotifyDelegatePermissionBuilder(),
        new RelationshipCanRejectPermissionBuilder(),
        new RelationshipCanViewPermissionBuilder(),
    ];

}