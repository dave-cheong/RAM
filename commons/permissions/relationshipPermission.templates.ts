import {Permission, Permissions} from '../dtos/permission.dto';

export const RelationshipCanViewPermission = new Permission(
    'relationship-can-view',
    'A relationship can be viewed if the parties it is associated with have access.',
    false
);

export const RelationshipCanModifyPermission = new Permission(
    'relationship-can-modify',
    'A relationship can be modified if it is new or if it hasn\'t yet been accepted.',
    false
);

export const RelationshipCanClaimPermission = new Permission(
    'relationship-can-claim',
    'A relationship can be viewed if the parties it is associated with have access.',
    false
);

export const RelationshipCanAcceptPermission = new Permission(
    'relationship-can-accept',
    'A relationship can be accepted if the party accepting it is the assigned delegate and they are authenticated with the required identity strength.',
    false
);

export const RelationshipCanRejectPermission = new Permission(
    'relationship-can-reject',
    'A relationship can be reject if the party rejecting is the assigned delegate.',
    false
);

export const RelationshipCanNotifyDelegatePermission = new Permission(
    'relationship-can-notify',
    'A relationship delegate can be notified if the relationship is pending.',
    false
);

export const Relationships = new Permissions()
        .push(RelationshipCanViewPermission)
        .push(RelationshipCanModifyPermission)
        .push(RelationshipCanClaimPermission)
        .push(RelationshipCanAcceptPermission)
        .push(RelationshipCanRejectPermission)
        .push(RelationshipCanNotifyDelegatePermission)
    ;
