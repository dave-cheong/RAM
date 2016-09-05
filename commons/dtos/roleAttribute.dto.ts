import {Builder} from './builder.dto';
import {IHrefValue} from './hrefValue.dto';
import {IRoleAttributeName, RoleAttributeName} from './roleAttributeName.dto';

export interface IRoleAttribute {
    value: string[];
    attributeName: IHrefValue<IRoleAttributeName>;
}

export class RoleAttribute implements IRoleAttribute {
    public static build(sourceObject: any): IRoleAttribute {
        return new Builder<IRoleAttribute>(sourceObject, this)
            .mapHref('attributeName', RoleAttributeName)
            .build();
    }

    constructor(public value: string[],
                public attributeName: IHrefValue<IRoleAttributeName>) {
    }
}

