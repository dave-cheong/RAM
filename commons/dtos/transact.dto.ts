import {Builder} from './builder.dto';

export interface ITransactRequest {
    clientABN: string;
    ssid: string;
    agencyService: string;
}

export class TransactRequest implements ITransactRequest {
    public static build(sourceObject: any): ITransactRequest {
        return new Builder<ITransactRequest>(sourceObject, this)
            .build();
    }

    constructor(public clientABN: string,
                public ssid: string,
                public agencyService: string) {
    }
}

export interface ITransactResponse {
    request: ITransactRequest;
    allowed: boolean;
}

export class TransactResponse implements ITransactResponse {
    public static build(sourceObject: any): ITransactResponse {
        return new Builder<ITransactResponse>(sourceObject, this)
            .map('request', TransactRequest)
            .build();
    }

    constructor(public request: ITransactRequest,
                public allowed: boolean) {
    }
}