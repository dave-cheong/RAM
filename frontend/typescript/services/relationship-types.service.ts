import { Injectable }           from '@angular/core';
import { RAMRestService }       from './ram-rest.service';
import { Observable }           from 'rxjs/Rx';
import {
    IRelationshipType,
    IRelationshipAttributeNameUsage
} from '../../../commons/api';

// TODO: remove listRelatiohsipTypes from relationships.component.

@Injectable() export class RelationshipTypesService {
    // Once a relationship type is loaded, cache it locally by type
    private typeCache: { [type: string]: IRelationshipType } = {};
    private metaCache: { [code: string]: IRelationshipAttributeNameUsage } = {};

    // load from server and update cache references
    private loadRelationshipType =
    (type: string): Observable<IRelationshipType> => {
        return this.rest.findRelationshipTypeByCode(type).map(
        (data) => {
            this.typeCache[type] = data;
            data.relationshipAttributeNames.forEach(
            (ranu:IRelationshipAttributeNameUsage) => {
                const code = type + ':' + ranu.attributeNameDef.value.code;
                this.metaCache[code] =ranu;
            });
            return data;
        });
    };

    constructor(private rest: RAMRestService) {}

    public getByType(type: string): Observable<IRelationshipType> {
        if (this.typeCache[type]) {
            return Observable.of(this.typeCache[type]);
        } else {
            return this.loadRelationshipType(type);
        }
    }

     public getByCode = (type: string, code: string):
     Observable<IRelationshipAttributeNameUsage> => {
        return this.getByType(type).map(() => {
            return this.metaCache[type + ':' + code];
        });
    }
}