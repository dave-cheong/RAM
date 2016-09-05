import {Builder} from './builder.dto';
import {Party} from './party.dto';
import {RelationshipAttribute} from './relationshipAttribute.dto';

export interface IName {
    givenName?: string;
    familyName?: string;
    unstructuredName?: string;
    _displayName?: string;
}

export class Name implements IName {
    public static build(sourceObject: any): IName {
        return new Builder<IName>(sourceObject, this)
            .mapHref('delegate', Party)
            .map('subjectNickName', Name)
            .map('delegateNickName', Name)
            .mapArray('attributes', RelationshipAttribute)
            .build();
    }

    constructor(public givenName: string,
                public familyName: string,
                public unstructuredName: string,
                public _displayName: string) {
    }

    public displayName(): string {
        return this.unstructuredName ? this.unstructuredName : this.givenName + ' ' + this.familyName;
    }
}