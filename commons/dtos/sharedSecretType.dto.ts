import {Builder} from './builder.dto';
import {ICodeDecode, CodeDecode} from './codeDecode.dto';

export interface ISharedSecretType extends ICodeDecode {
    domain: string;
}

export class SharedSecretType extends CodeDecode implements ISharedSecretType {
    public static build(sourceObject: any): ISharedSecretType {
        return new Builder<ISharedSecretType>(sourceObject, this)
            .build();
    }

    constructor(code: string,
                shortDecodeText: string,
                longDecodeText: string,
                startTimestamp: Date,
                endTimestamp: Date,
                public domain: string) {
        super(code, shortDecodeText, longDecodeText, startTimestamp, endTimestamp);
    }
}
