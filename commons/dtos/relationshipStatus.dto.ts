import {Builder} from './builder.dto';

export interface IRelationshipStatus {
    code: string;
    shortDecodeText: string;
}

export class RelationshipStatus implements IRelationshipStatus {
    public static build(sourceObject: any): IRelationshipStatus {
        return new Builder<IRelationshipStatus>(sourceObject, this)
            .build();
    }

    constructor(public code: string,
                public shortDecodeText: string) {
    }
}