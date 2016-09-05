import {Builder} from './builder.dto';
import {ILink, IHasLinks} from './link.dto';
import {IAgencyUser, AgencyUser} from './agencyUser.dto';
import {IIdentity, Identity} from './identity.dto';

export interface IPrincipal extends IHasLinks {
    _links: ILink[];
    id: string;
    displayName: string;
    agencyUserInd: boolean;
    agencyUser?: IAgencyUser;
    identity?: IIdentity;
}

export class Principal implements IPrincipal {
    public static build(sourceObject: any): IPrincipal {
        return new Builder<IPrincipal>(sourceObject, this)
            .map('agencyUser', AgencyUser)
            .map('identity', Identity)
            .build();
    }
    constructor(public _links: ILink[],
                public id: string,
                public displayName: string,
                public agencyUserInd: boolean,
                public agencyUser?: IAgencyUser,
                public identity?: IIdentity) {
    }
}