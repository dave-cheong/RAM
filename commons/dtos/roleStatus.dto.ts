import {Builder} from './builder.dto';

export interface IRoleStatus {
    code: string;
    shortDecodeText: string;
}

export class RoleStatus implements IRoleStatus {

    public static build(sourceObject: any): IRoleStatus {
        return new Builder<IRoleStatus>(sourceObject, this)
            .build();
    }

    constructor(public code: string,
                public shortDecodeText: string) {
    }

}