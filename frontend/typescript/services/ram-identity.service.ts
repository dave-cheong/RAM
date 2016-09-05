import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {RAMRestService} from './ram-rest.service';
import {IIdentity, IName} from '../../../commons/api';

@Injectable()
export class RAMIdentityService {

    private _identityCache: { [index: string]: IName } = {};

    constructor(private rest: RAMRestService) {
    }

    public getDefaultName(identityValue: string): Observable<IName> {
        if (this._identityCache[identityValue]) {
            return Observable.of(this._identityCache[identityValue]);
        } else {
            return this.rest
                .findIdentityByValue(identityValue)
                .map((identity: IIdentity) => identity.profile.name)
                .do((profileName) => this._identityCache[identityValue] = profileName)
                .publishReplay()
                .refCount();
        }
    }
}