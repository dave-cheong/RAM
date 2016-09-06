import {ILink, IHasLinks} from './link.dto';
import {IPermission, IHasPermissions, Permission, Permissions} from './permission.dto';

export interface IResource extends IHasLinks, IHasPermissions {
    get(template: IPermission): IPermission;
    getDenied(templates: IPermission[]): IPermission[];
    isAllowed(templates: IPermission[]): boolean;
}

export class Resource implements IResource {

    public _links: ILink[] = [];
    public _perms: IPermission[] = [];

    constructor(permissions: Permissions) {
        if (permissions) {
            for (let permission of permissions.toArray()) {
                this._perms.push(new Permission(
                    permission.code,
                    permission.description,
                    permission.value,
                    permission.messages,
                    undefined
                ));
                if (permission.value && permission.link) {
                    this._links.push(permission.link);
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

}
