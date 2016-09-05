import {Builder} from './builder.dto';
import {ISharedSecretType, SharedSecretType} from './sharedSecretType.dto';

export interface ISharedSecret {
    value: string;
    sharedSecretType: ISharedSecretType;
}

export class SharedSecret implements ISharedSecret {
    public static build(sourceObject: any): ISharedSecret {
        return new Builder<ISharedSecret>(sourceObject, this)
            .map('sharedSecretType', SharedSecretType)
            .build();
    }

    constructor(public value: string,
                public sharedSecretType: ISharedSecretType) {
    }
}