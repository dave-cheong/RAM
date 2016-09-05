import {Builder} from './builder.dto';
import {ICodeDecode, CodeDecode} from './codeDecode.dto';

export interface ILegislativeProgram extends ICodeDecode {
}

export class LegislativeProgram extends CodeDecode implements ILegislativeProgram {
    public static build(sourceObject: any): ILegislativeProgram {
        return new Builder<ILegislativeProgram>(sourceObject, this)
            .build();
    }

    constructor(code: string,
                shortDecodeText: string,
                longDecodeText: string,
                startTimestamp: Date,
                endTimestamp: Date) {
        super(code, shortDecodeText, longDecodeText, startTimestamp, endTimestamp);
    }
}