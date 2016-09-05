import {Builder} from './builder.dto';
import {ICodeDecode, CodeDecode} from './codeDecode.dto';
import {IRoleAttributeNameUsage, RoleAttributeNameUsage} from './roleAttributeNameUsage.dto';

export interface IRoleType extends ICodeDecode {
    roleAttributeNames: IRoleAttributeNameUsage[];
}

export class RoleType extends CodeDecode implements IRoleType {
    public static build(sourceObject: any): IRoleType {
        return new Builder<IRoleType>(sourceObject, this)
            .mapArray('roleAttributeNames', RoleAttributeNameUsage)
            .build();
    }

    constructor(code: string,
                shortDecodeText: string,
                longDecodeText: string,
                startTimestamp: Date,
                endTimestamp: Date,
                public roleAttributeNames: IRoleAttributeNameUsage[]) {
        super(code, shortDecodeText, longDecodeText, startTimestamp, endTimestamp);
    }
}
