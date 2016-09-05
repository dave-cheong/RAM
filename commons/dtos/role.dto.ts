import {Builder} from './builder.dto';
import {ILink, IHasLinks} from './link.dto';
import {IHrefValue} from './hrefValue.dto';
import {IParty, Party} from './party.dto';
import {IRoleType, RoleType} from './roleType.dto';
import {IRoleAttribute, RoleAttribute} from './roleAttribute.dto';

export interface IRole extends IHasLinks {
    code: string;
    roleType: IHrefValue<IRoleType>;
    party: IHrefValue<IParty>;
    startTimestamp: Date;
    endTimestamp?: Date;
    endEventTimestamp?: Date,
    assignedTimestamp?: Date,
    attributes: IRoleAttribute[];
}

export class Role implements IRole {
    public static build(sourceObject: any): IRole {
        return new Builder<IRole>(sourceObject, this)
            .mapHref('roleType', RoleType)
            .mapHref('party', Party)
            .mapArray('attributes', RoleAttribute)
            .build();
    }

    constructor(public _links: ILink[],
                public code: string,
                public roleType: IHrefValue<IRoleType>,
                public party: IHrefValue<IParty>,
                public startTimestamp: Date,
                public endTimestamp: Date,
                public endEventTimestamp: Date,
                public assignedTimestamp: Date,
                public status: string,
                public attributes: IRoleAttribute[]) {
    }
}
