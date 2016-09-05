import {Builder} from './builder.dto';
import {ILink} from './link.dto';

export interface IPermission {
    code: string;
    description: string;
    value: boolean;
    messages: string[];
    link: ILink;
}

export class Permission implements IPermission {
    public static build(sourceObject: any): IPermission {
        return new Builder<IPermission>(sourceObject, this)
            .build();
    }

    constructor(public code: string,
                public description: string,
                public value: boolean,
                public messages?: string[],
                public link?: ILink) {
    }
}

export interface IHasPermissions {
    _perms: IPermission[];
}

export class Permissions {

    private array: IPermission[] = [];

    public push(permission: IPermission, condition: boolean = true): Permissions {
        if (condition) {
            this.array.push(permission);
        }
        return this;
    }

    public toArray(): IPermission[] {
        return this.array;
    }

}
