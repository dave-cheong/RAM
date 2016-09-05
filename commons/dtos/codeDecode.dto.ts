import {Builder} from './builder.dto';
import {IHrefValue} from './hrefValue.dto';

export interface ICodeDecode {
    code: string;
    shortDecodeText: string;
    longDecodeText: string;
    startTimestamp: Date;
    endTimestamp: Date;
}

export class CodeDecode implements ICodeDecode {

    public static build(sourceObject: any): ICodeDecode {
        return new Builder<ICodeDecode>(sourceObject, this)
            .build();
    }

    public static getRefByCode(refs: IHrefValue<ICodeDecode>[], code: string): IHrefValue<ICodeDecode> {
        if (refs) {
            for (let ref of refs) {
                if (ref.value.code === code) {
                    return ref;
                }
            }
        }
        return undefined;
    }

    constructor(public code: string,
                public shortDecodeText: string,
                public longDecodeText: string,
                public startTimestamp: Date,
                public endTimestamp: Date) {
    }

}