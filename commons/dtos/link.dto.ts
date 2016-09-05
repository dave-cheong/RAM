import {Builder} from './builder.dto';

export interface ILink {
    type: string;
    method: string;
    href: string;
}

export class Link implements ILink {
    public static build(sourceObject: any): ILink {
        return new Builder<ILink>(sourceObject, this)
            .build();
    }

    constructor(public type: string,
                public method: string,
                public href: string) {
    }
}

export interface IHasLinks {
    _links: ILink[];
}