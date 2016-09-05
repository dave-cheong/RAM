import {Builder} from './builder.dto';

export interface IProfileProvider {
    code: string;
    shortDecodeText: string;
}

export class ProfileProvider implements IProfileProvider {
    public static build(sourceObject: any): IProfileProvider {
        return new Builder<IProfileProvider>(sourceObject, this)
            .build();
    }

    constructor(public code: string,
                public shortDecodeText: string) {
    }
}