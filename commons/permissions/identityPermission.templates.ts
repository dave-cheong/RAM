import {Permissions, Permission} from '../dtos/permission.dto';
import {Constants} from '../constants';

// todo descriptions to be filled out

export const IdentityCanViewPermission = new Permission(
    'identity-can-view',
    'Description not available.',
    false,
    Constants.Link.SELF
);

export const IdentityCanListRelationshipsPermission = new Permission(
    'identity-can-list-relationships',
    'Description not available.',
    false,
    Constants.Link.SELF
);

export const IdentityCanCreateRelationshipPermission = new Permission(
    'identity-can-create-relationship',
    'Description not available.',
    false,
    Constants.Link.SELF
);

export const IdentityCanListRolesPermission = new Permission(
    'identity-can-list-roles',
    'Description not available.',
    false,
    Constants.Link.SELF
);

export const IdentityCanCreateRolePermission = new Permission(
    'identity-can-create-role',
    'Description not available.',
    false,
    Constants.Link.SELF
);

export const IdentityCanListAuskeysPermission = new Permission(
    'identity-can-list-auskeys',
    'Description not available.',
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
