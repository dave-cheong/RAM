import {Builder} from './builder.dto';
import {IHrefValue} from './hrefValue.dto';
import {IRoleAttributeName, RoleAttributeName} from './roleAttributeName.dto';

export interface IRoleAttributeNameUsage {
    optionalInd: boolean;
    defaultValue: string;
    attributeNameDef: IHrefValue<IRoleAttributeName>;
}

export class RoleAttributeNameUsage implements IRoleAttributeNameUsage {
    public static build(sourceObject: any): IRoleAttributeNameUsage {
        return new Builder<IRoleAttributeNameUsage>(sourceObject, this)
            .mapHref('attributeNameDef', RoleAttributeName)
            .build();
    }

    constructor(public optionalInd: boolean,
                public defaultValue: string,
                public attributeNameDef: IHrefValue<IRoleAttributeName>) {
    }
}