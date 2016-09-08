import {Permissions, Permission} from '../dtos/permission.dto';
import {Constants} from '../constants';

export const IdentityCanViewPermission = new Permission(
    'identity-can-view',
    'A relationship can be viewed if the parties it is associated with have access.',
    false,
    Constants.Link.SELF
);

export const IdentityCanListRelationshipsPermission = new Permission(
    'identity-can-list-relationships',
    'A relationship can be viewed if the parties it is associated with have access.',
    false,
    Constants.Link.SELF
);

export const IdentityCanCreateRelationshipPermission = new Permission(
    'identity-can-create-relationship',
    'A relationship can be viewed if the parties it is associated with have access.',
    false,
    Constants.Link.SELF
);

export const IdentityCanListRolesPermission = new Permission(
    'identity-can-list-roles',
    'A relationship can be viewed if the parties it is associated with have access.',
    false,
    Constants.Link.SELF
);

export const IdentityCanCreateRolePermission = new Permission(
    'identity-can-create-role',
    'A relationship can be viewed if the parties it is associated with have access.',
    false,
    Constants.Link.SELF
);

export const IdentityCanListAuskeysPermission = new Permission(
    'identity-can-list-auskeys',
    'A relationship can be viewed if the parties it is associated with have access.',
    false,
    Constants.Link.SELF
);

export const IdentityPermissions = new Permissions()
        .push(IdentityCanViewPermission)
        .push(IdentityCanListRelationshipsPermission)
        .push(IdentityCanCreateRelationshipPermission)
        .push(IdentityCanListRolesPermission)
        .push(IdentityCanCreateRolePermission)
        .push(IdentityCanListAuskeysPermission)
    ;
