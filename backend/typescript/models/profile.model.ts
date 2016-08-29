import * as mongoose from 'mongoose';
import {RAMEnum, IRAMObject, RAMSchema, IRAMObjectContract, RAMObjectContractImpl, Model} from './base';
import {Url} from './url';
import {IName, NameModel} from './name.model';
import {ISharedSecret, SharedSecretModel} from './sharedSecret.model';
import {
    HrefValue,
    Profile as DTO,
    ProfileProvider as ProfileProviderDTO
} from '../../../commons/RamAPI';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _NameModel = NameModel;

/* tslint:disable:no-unused-variable */
const _SharedSecretModel = SharedSecretModel;

// enums, utilities, helpers ..........................................................................................

export class ProfileProvider extends RAMEnum {

    public static ABR = new ProfileProvider('ABR', 'ABR');
    public static AuthenticatorApp = new ProfileProvider('AUTHENTICATOR_APP', 'Authenticator App');
    public static Invitation = new ProfileProvider('INVITATION', 'Invitation'); // TODO validate for temp identities
    public static MyGov = new ProfileProvider('MY_GOV', 'myGov');
    public static SelfAsserted = new ProfileProvider('SELF_ASSERTED', 'Self Asserted');
    public static VanguardFAS = new ProfileProvider('VANGUARD_FAS', 'Vanguard FAS');
    public static VanguardMyGov = new ProfileProvider('VANGUARD_MY_GOV', 'Vanguard myGov');

    protected static AllValues = [
        ProfileProvider.ABR,
        ProfileProvider.AuthenticatorApp,
        ProfileProvider.Invitation,
        ProfileProvider.MyGov,
        ProfileProvider.SelfAsserted,
        ProfileProvider.VanguardFAS,
        ProfileProvider.VanguardMyGov
    ];

    constructor(public code: string, shortDecodeText: string) {
        super(code, shortDecodeText);
    }

    public async toHrefValue(includeValue: boolean): Promise<HrefValue<ProfileProviderDTO>> {
        return Promise.resolve(new HrefValue(
            await Url.forProfileProvider(this),
            includeValue ? this.toDTO() : undefined
        ));
    }

    public toDTO(): ProfileProviderDTO {
        return new ProfileProviderDTO(this.code, this.shortDecodeText);
    }
}

// exports ............................................................................................................

export interface IProfile extends IRAMObject, IProfileInstanceContract {
}

export interface IProfileModel extends mongoose.Model<IProfile>, IProfileStaticContract {
}

export let ProfileModel: IProfileModel;

// schema .............................................................................................................

const ProfileSchema = RAMSchema({
    provider: {
        type: String,
        required: [true, 'Provider is required'],
        trim: true,
        enum: ProfileProvider.valueStrings()
    },
    name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Name',
        required: [true, 'Name is required']
    },
    sharedSecrets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SharedSecret'
    }]
});

// instance ...........................................................................................................

export interface IProfileInstanceContract extends IRAMObjectContract {
    provider: string;
    name: IName;
    sharedSecrets: [ISharedSecret];
    providerEnum(): ProfileProvider;
    getSharedSecret(code: string): ISharedSecret;
    toHrefValue(includeValue: boolean): Promise<HrefValue<DTO>>;
    toDTO(): Promise<DTO>;
}

class ProfileInstanceContractImpl extends RAMObjectContractImpl implements IProfileInstanceContract {

    public provider: string;
    public name: IName;
    public sharedSecrets: [ISharedSecret];

    public providerEnum(): ProfileProvider {
        return ProfileProvider.valueOf(this.provider) as ProfileProvider;
    }

    public getSharedSecret(code: string): ISharedSecret {
        if (code && this.sharedSecrets) {
            for (let sharedSecret of this.sharedSecrets) {
                if (sharedSecret.sharedSecretType.code === code) {
                    return sharedSecret;
                }
            }
        }
        return null;
    }

    public async toHrefValue(includeValue: boolean): Promise<HrefValue<DTO>> {
        return new HrefValue(
            null, // TODO do these have endpoints?
            includeValue ? await this.toDTO() : undefined
        );
    }

    public async toDTO(): Promise<DTO> {
        return new DTO(
            this.provider,
            await this.name.toDTO(),
            undefined
        );
    }

}

/* tslint:disable:no-empty-interfaces */
export interface IProfileModel extends mongoose.Model<IProfile> {
}

// static .............................................................................................................

interface IProfileStaticContract {
}

class ProfileStaticContractImpl implements IProfileStaticContract {
}

// concrete model .....................................................................................................

ProfileModel = Model(
    'Profile',
    ProfileSchema,
    ProfileInstanceContractImpl,
    ProfileStaticContractImpl
) as IProfileModel;