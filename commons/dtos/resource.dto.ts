import {ILink, IHasLinks} from './link.dto';
import {IPermission, IHasPermissions, Permission, Permissions} from './permission.dto';

export interface IResource extends IHasLinks, IHasPermissions {
    getPermission(template: IPermission): IPermission;
    getDeniedPermissions(templates: IPermission[]): IPermission[];
    isPermissionAllowed(templates: IPermission[]): boolean;
    isPermissionDenied(templates: IPermission[]): boolean;
}

export class Resource implements IResource {

    public _links: ILink[] = [];
    public _perms: IPermission[] = [];

    // todo add the other meta fields (https://github.com/atogov/RAM/wiki/ReST-JSON-payloads)

    constructor(permissions: Permissions) {
        if (permissions) {
            for (let permission of permissions.toArray()) {
                let clonedPermission = new Permission(
                    permission.code,
                    permission.description,
                    permission.value,
                    permission.messages,
                    undefined
                );
                this._perms.push(clonedPermission);
                if (permission.value && permission.link) {
                    this._links.push(permission.link);
                    clonedPermission.linkType = permission.link.type;
                }
            }
        }
    }

    public getPermission(template: IPermission): IPermission {
        return new Permissions()
            .pushAll(this._perms)
            .get(template);
    }

    public getDeniedPermissions(templates: IPermission[]): IPermission[] {
        return new Permissions()
            .pushAll(this._perms)
            .getDenied(templates);
    }

    public isPermissionAllowed(templates: IPermission[]): boolean {
        return new Permissions()
            .pushAll(this._perms)
            .isAllowed(templates);
    }

    public isPermissionDenied(templates: IPermission[]): boolean {
        return new Permissions()
            .pushAll(this._perms)
            .isDenied(templates);
    }

}
