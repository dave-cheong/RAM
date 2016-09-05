import {Builder} from './builder.dto';
import {Name, IName} from './name.dto';
import {SharedSecret, ISharedSecret} from './sharedSecret.dto';

export interface IProfile {
    provider: string;
    name: IName;
    sharedSecrets: ISharedSecret[];
    getSharedSecret(code: string): ISharedSecret;
    insertOrUpdateSharedSecret(sharedSecret: ISharedSecret): void;
    deleteSharedSecret(code: string): void;
}

export class Profile implements IProfile {

    public static build(sourceObject: any): IProfile {
        return new Builder<IProfile>(sourceObject, this)
            .map('name', Name)
            .mapArray('sharedSecrets', SharedSecret)
            .build();
    }

    constructor(public provider: string,
                public name: Name,
                public sharedSecrets: SharedSecret[]) {
    }

    public getSharedSecret(code: string): ISharedSecret {
        for (let sharedSecret of this.sharedSecrets) {
            if (sharedSecret.sharedSecretType.code === code) {
                return sharedSecret;
            }
        }
        return null;
    }

    public insertOrUpdateSharedSecret(sharedSecret: ISharedSecret) {
        if (sharedSecret) {
            this.deleteSharedSecret(sharedSecret.sharedSecretType.code);
            this.sharedSecrets.push(sharedSecret);
        }
    }

    public deleteSharedSecret(code: string) {
        if (code) {
            for (let i = 0; i < this.sharedSecrets.length; i = i + 1) {
                let aSharedSecret = this.sharedSecrets[i];
                if (aSharedSecret.sharedSecretType.code === code) {
                    this.sharedSecrets.splice(i, 1);
                    break;
                }
            }
        }
    }

}