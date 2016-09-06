import {IPermissionBuilder} from '../models/base';
import {IIdentity} from '../models/identity.model';
import {IName} from '../models/name.model';
import {IParty} from '../models/party.model';
import {IProfile} from '../models/profile.model';
import {IRole} from '../models/role.model';
import {IRelationship} from '../models/relationship.model';
import {ISharedSecret} from '../models/sharedSecret.model';
import {RelationshipCanAcceptPermissionBuilder} from './relationshipCanAcceptPermission.builder';
import {RelationshipCanClaimPermissionBuilder} from './relationshipCanClaimPermission.builder';
import {RelationshipCanModifyPermissionBuilder} from './relationshipCanModifyPermission.builder';
import {RelationshipCanNotifyDelegatePermissionBuilder} from './relationshipCanNotifyDelegatePermission.builder';
import {RelationshipCanRejectPermissionBuilder} from './relationshipCanRejectPermission.builder';
import {RelationshipCanViewPermissionBuilder} from './relationshipCanViewPermission.builder';
import {IRelationshipAttributeNameUsage} from '../models/relationshipAttributeNameUsage.model';
import {IRelationshipAttribute} from '../models/relationshipAttribute.model';
import {IRoleAttribute} from '../models/roleAttribute.model';
import {IRoleAttributeNameUsage} from '../models/roleAttributeNameUsage.model';

export class PermissionBuilders {

    public static identity: IPermissionBuilder<IIdentity>[] = [];

    public static iname: IPermissionBuilder<IName>[] = [];

    public static party: IPermissionBuilder<IParty>[] = [];

    public static profile: IPermissionBuilder<IProfile>[] = [];

    public static relationship: IPermissionBuilder<IRelationship>[] = [
        new RelationshipCanAcceptPermissionBuilder(),
        new RelationshipCanClaimPermissionBuilder(),
        new RelationshipCanModifyPermissionBuilder(),
        new RelationshipCanNotifyDelegatePermissionBuilder(),
        new RelationshipCanRejectPermissionBuilder(),
        new RelationshipCanViewPermissionBuilder(),
    ];

    public static relationshipAttribute: IPermissionBuilder<IRelationshipAttribute>[] = [];

    public static relationshipAttributeNameUsage: IPermissionBuilder<IRelationshipAttributeNameUsage>[] = [];

    public static role: IPermissionBuilder<IRole>[] = [];

    public static sharedSecret: IPermissionBuilder<ISharedSecret>[] = [];

    public static roleAttribute: IPermissionBuilder<IRoleAttribute>[] = [];

    public static roleAttributeNameUsage: IPermissionBuilder<IRoleAttributeNameUsage>[] = [];

}