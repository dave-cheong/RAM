import {Builder} from './builder.dto';
import {IHrefValue} from './hrefValue.dto';
import {IRelationshipAttributeName, RelationshipAttributeName} from './relationshipAttributeName.dto';

export interface IRelationshipAttribute {
    value: string[];
    attributeName: IHrefValue<IRelationshipAttributeName>;
}

export class RelationshipAttribute implements IRelationshipAttribute {
    public static build(sourceObject: any): IRelationshipAttribute {
        return new Builder<IRelationshipAttribute>(sourceObject, this)
            .mapHref('attributeName', RelationshipAttributeName)
            .build();
    }

    constructor(public value: string[],
                public attributeName: IHrefValue<IRelationshipAttributeName>) {
    }
}