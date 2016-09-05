import {Builder} from './builder.dto';

export interface IAUSkey {
    id: string;
    auskeyType: string;
}

export class AUSkey implements IAUSkey {
    public static build(sourceObject: any): IAUSkey {
        return new Builder<IAUSkey>(sourceObject, this)
            .build();
    }

    constructor(public id: string,
                public auskeyType: string) {
    }
}