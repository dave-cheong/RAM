import {Permissions} from '../dtos/permission.dto';
import {RelationshipPermissionTemplates} from './relationshipPermission.templates';
import {IdentityPermissionTemplates} from './identityPermission.templates';
import {NamePermissionTemplates} from './namePermission.templates';
import {PartyPermissionTemplates} from './partyPermission.templates';
import {ProfilePermissionTemplates} from './profilePermission.templates';
import {RolePermissionTemplates} from './rolePermission.templates';
import {SharedSecretPermissionTemplates} from './sharedSecretPermission.templates';
import {RelationshipAttributePermissionTemplates} from './relationshipAttributePermission.templates';
import {RelationshipAttributeNameUsagePermissionTemplates} from './relationshipAttributeNameUsagePermission.templates';
import {RoleAttributePermissionTemplates} from './roleAttributePermission.templates';
import {RoleAttributeNameUsagePermissionTemplates} from './roleAttributeNameUsagePermission.templates';

export class PermissionTemplates {

    public static identity: Permissions = IdentityPermissionTemplates;

    public static iname: Permissions = NamePermissionTemplates;

    public static party: Permissions = PartyPermissionTemplates;

    public static profile: Permissions = ProfilePermissionTemplates;

    public static relationship: Permissions = RelationshipPermissionTemplates;

    public static relationshipAttribute: Permissions = RelationshipAttributePermissionTemplates;

    public static relationshipAttributeNameUsage: Permissions = RelationshipAttributeNameUsagePermissionTemplates;

    public static role: Permissions = RolePermissionTemplates;

    public static roleAttribute: Permissions = RoleAttributePermissionTemplates;

    public static roleAttributeNameUsage: Permissions = RoleAttributeNameUsagePermissionTemplates;

    public static sharedSecret: Permissions = SharedSecretPermissionTemplates;

}