import {Builder} from './builder.dto';
import {IHrefValue, HrefValue} from './hrefValue.dto';
import {IRelationshipAttributeName, RelationshipAttributeName} from './relationshipAttributeName.dto';

export interface IRelationshipAttributeNameUsage {
    optionalInd: boolean;
    defaultValue: string;
    attributeNameDef: IHrefValue<IRelationshipAttributeName>;
    sortOrder: number;
}

export class RelationshipAttributeNameUsage implements IRelationshipAttributeNameUsage {
    public static build(sourceObject: any): IRelationshipAttributeNameUsage {
        return new Builder<IRelationshipAttributeNameUsage>(sourceObject, this)
            .mapHref('attributeNameDef', RelationshipAttributeName)
            .build();
    }

    constructor(public optionalInd: boolean,
                public defaultValue: string,
                public attributeNameDef: HrefValue<RelationshipAttributeName>,
                public sortOrder: number) {
    }
}