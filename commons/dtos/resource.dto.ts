import {ILink, IHasLinks} from './link.dto';
import {IPermission, IHasPermissions, Permission, Permissions} from './permission.dto';

export interface IResource extends IHasLinks, IHasPermissions {
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

    public isAllowed(template: IPermission): boolean {
        return new Permissions()
            .pushAll(this._perms)
            .isAllowed(template);
    }

}
