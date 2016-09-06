import {IPermission, Permission, Permissions} from '../dtos/permission.dto';

export const RelationshipCanViewPermissionTemplate = new Permission(
    'relationship-can-view',
    'A relationship can be viewed if the parties it is associated with have access.',
    false
);

export const RelationshipCanModifyPermissionTemplate = new Permission(
    'relationship-can-modify',
    'A relationship can be modified if it is new or if it hasn\'t yet been accepted.',
    false
);

export const RelationshipCanClaimPermissionTemplate = new Permission(
    'relationship-can-claim',
    'A relationship can be viewed if the parties it is associated with have access.',
    false
);

export const RelationshipCanAcceptPermissionTemplate = new Permission(
    'relationship-can-accept',
    'A relationship can be accepted if the party accepting it is the assigned delegate and they are authenticated with the required identity strength.',
    false
);

export const RelationshipCanRejectPermissionTemplate = new Permission(
    'relationship-can-reject',
    'A relationship can be reject if the party rejecting is the assigned delegate.',
    false
);

export const RelationshipCanNotifyDelegatePermissionTemplate = new Permission(
    'relationship-can-notify',
    'A relationship delegate can be notified if the relationship is pending.',
    false
);

export const RelationshipPermissionTemplates = new Permissions()
        .push(RelationshipCanViewPermissionTemplate)
        .push(RelationshipCanModifyPermissionTemplate)
        .push(RelationshipCanClaimPermissionTemplate)
        .push(RelationshipCanAcceptPermissionTemplate)
        .push(RelationshipCanRejectPermissionTemplate)
        .push(RelationshipCanNotifyDelegatePermissionTemplate)
    ;
