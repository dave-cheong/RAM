import {ILink, IHasLinks} from './link.dto';
import {IPermission, IHasPermissions, Permission, Permissions} from './permission.dto';

export interface IResource extends IHasLinks, IHasPermissions {
    get(template: IPermission): IPermission;
    getDenied(templates: IPermission[]): IPermission[];
    isAllowed(templates: IPermission[]): boolean;
    isDenied(templates: IPermission[]): boolean;
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

    public get(template: IPermission): IPermission {
        return new Permissions()
            .pushAll(this._perms)
            .get(template);
    }

    public getDenied(templates: IPermission[]): IPermission[] {
        return new Permissions()
            .pushAll(this._perms)
            .getDenied(templates);
    }

    public isAllowed(templates: IPermission[]): boolean {
        return new Permissions()
            .pushAll(this._perms)
            .isAllowed(templates);
    }

    public isDenied(templates: IPermission[]): boolean {
        return new Permissions()
            .pushAll(this._perms)
            .isDenied(templates);
    }

}
