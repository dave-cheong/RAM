import {Builder} from './builder.dto';

export interface IPartyType {
    code: string;
    shortDecodeText: string;
}

export class PartyType implements IPartyType {
    public static build(sourceObject: any): IPartyType {
        return new Builder<IPartyType>(sourceObject, this)
            .build();
    }

    constructor(public code: string,
                public shortDecodeText: string) {
    }
}