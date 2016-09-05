import {Builder} from './builder.dto';
import {ILink, Link, IHasLinks} from './link.dto';
import {IHrefValue, HrefValue} from './hrefValue.dto';
import {IIdentity, Identity} from './identity.dto';

export interface IParty extends IHasLinks {
    _links: ILink[];
    partyType: string;
    identities: IHrefValue<IIdentity>[];
}

export class Party implements IParty {
    public static build(sourceObject: any): IParty {
        return new Builder<IParty>(sourceObject, this)
            .mapArray('_links', Link)
            .mapArray('identities', HrefValue, Identity)
            .build();
    }

    constructor(public _links: ILink[],
                public partyType: string,
                public identities: HrefValue<Identity>[]) {
    }
}