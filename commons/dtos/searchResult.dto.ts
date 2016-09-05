import {Builder} from './builder.dto';
import {ILink} from './link.dto';
import {HrefValue} from './hrefValue.dto';

export interface ISearchResult<T> {
    page: number,
    totalCount: number,
    pageSize: number,
    list: T[];
}

export class SearchResult<T> implements ISearchResult<T> {

    public static build(sourceObject: any, targetClass: any): ILink {
        return new Builder<ILink>(sourceObject, this)
            .mapArray('list', HrefValue, targetClass)
            .build();
    }

    constructor(public page: number, public totalCount: number, public pageSize: number, public list: T[]) {
    }

    public map<U>(callback: (value: T, index: number, array: T[]) => U): SearchResult<U> {
        return new SearchResult(this.page, this.totalCount, this.pageSize, this.list.map(callback));
    }

}