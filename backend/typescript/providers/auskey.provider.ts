import {conf} from '../bootstrap';
import {IAUSkey, AUSkey, AUSkeyType} from '../models/auskey.model';
import {SearchResult} from '../../../commons/api';

const useMock = conf.auskeyProviderMock;
const MAX_PAGE_SIZE = 10;

class RepositoryValue {
    constructor(public STANDARD: number,
                public ADMINISTRATOR: number,
                public DEVICE: number) {
    }
}

const repository: {[key: string]: RepositoryValue} = {
    '10000000001': new RepositoryValue(3, 3, 3),
    '14126318518': new RepositoryValue(3, 3, 13),
    '20612553456': new RepositoryValue(3, 3, 2)
};

export interface IAUSkeyProvider {
    findById(id: string): Promise<IAUSkey>;
    searchByABN(abn: string, type: AUSkeyType, page: number, reqPageSize: number): Promise<SearchResult<IAUSkey>>;
    listByABN(abn: string, type: AUSkeyType): Promise<IAUSkey[]>; /* todo to be removed */
}

export class MockAUSkeyProvider implements IAUSkeyProvider {

    public async findById(id: string): Promise<IAUSkey> {
        const abn = id.split('-')[0];
        const type = id.split('-')[1];
        const ausKeys = await this.listByABN(abn, AUSkeyType.valueOf(type));
        for (let ausKey of ausKeys) {
            if (ausKey.id === id) {
                return Promise.resolve(ausKey);
            }
        }
        return undefined;
    }

    public searchByABN(abn: string, type: AUSkeyType, reqPage: number, reqPageSize: number): Promise<SearchResult<IAUSkey>> {
        const page: number = reqPage ? reqPage : 1;
        const pageSize: number = reqPageSize ? Math.min(reqPageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
        let abnScrubbed = abn.replace(/ /g, '');
        let values: any = repository[abnScrubbed];

        if (!values) {
            values = {};
            values[type.code] = 0;
        }
        let auskeys: IAUSkey[] = [];
        for (let i = 0; i < values[type.code]; i = i + 1) {
            let id = abn + '-' + type.code + '-' + (i + 1);
            auskeys.push(new AUSkey(id, type));
        }

        const first = (page - 1) * pageSize;
        const last = Math.min(first + pageSize, auskeys.length);

        return Promise.resolve(new SearchResult(page, auskeys.length, pageSize, auskeys.slice(first, last)));
    }

    public listByABN(abn: string, type: AUSkeyType): Promise<IAUSkey[]> {
        let abnScrubbed = abn.replace(/ /g, '');
        let values: any = repository[abnScrubbed];
        if (!values) {
            values[type.code] = 0;
        }
        let auskeys: IAUSkey[] = [];
        for (let i = 0; i < values[type.code]; i = i + 1) {
            let id = abn + '-' + type.code + '-' + (i + 1);
            auskeys.push(new AUSkey(id, type));
        }
        return Promise.resolve(auskeys);
    }

}

export class RealAUSkeyProvider implements IAUSkeyProvider {

    public findById(id: string): Promise<IAUSkey> {
        throw new Error('Not yet implemented');
    }

    public searchByABN(abn: string, type: AUSkeyType, page: number, reqPageSize: number): Promise<SearchResult<IAUSkey>> {
        throw new Error('Not yet implemented');
    }

    public listByABN(abn: string, type: AUSkeyType): Promise<IAUSkey[]> {
        throw new Error('Not yet implemented');
    }

}

export const AUSkeyProvider = (useMock ? new MockAUSkeyProvider() : new RealAUSkeyProvider()) as IAUSkeyProvider;
