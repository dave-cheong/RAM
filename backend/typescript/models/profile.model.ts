import * as mongoose from 'mongoose';
import {RAMEnum, IRAMObject, RAMSchema} from './base';
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

    constructor(public code:string, shortDecodeText:string) {
        super(code, shortDecodeText);
    }

    public async toHrefValue(includeValue:boolean): Promise<HrefValue<ProfileProviderDTO>> {
        return Promise.resolve(new HrefValue(
            await Url.forProfileProvider(this),
            includeValue ? this.toDTO() : undefined
        ));
    }

    public toDTO(): ProfileProviderDTO {
        return new ProfileProviderDTO(this.code, this.shortDecodeText);
    }
}

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

// interfaces .........................................................................................................

export interface IProfile extends IRAMObject {
    provider: string;
    name: IName;
    sharedSecrets: [ISharedSecret];
    providerEnum(): ProfileProvider;
    getSharedSecret(code:string): ISharedSecret;
    toHrefValue():Promise<HrefValue<DTO>>;
    toDTO():Promise<DTO>;
}

/* tslint:disable:no-empty-interfaces */
export interface IProfileModel extends mongoose.Model<IProfile> {
}

// instance methods ...................................................................................................

ProfileSchema.method('providerEnum', function () {
    return ProfileProvider.valueOf(this.provider);
});

ProfileSchema.method('getSharedSecret', function (code:string) {
    if (code && this.sharedSecrets) {
        for (let sharedSecret of this.sharedSecrets) {
            if (sharedSecret.sharedSecretType.code === code) {
                return sharedSecret;
            }
        }
    }
    return null;
});

ProfileSchema.method('toHrefValue', async function (includeValue:boolean) {
    return new HrefValue(
        null, // TODO do these have endpoints?
        includeValue ? this.toDTO() : undefined
    );
});

ProfileSchema.method('toDTO', async function () {
    return new DTO(
        this.provider,
        await this.name.toDTO(),
        undefined
    );
});

// static methods .....................................................................................................

// concrete model .....................................................................................................

export const ProfileModel = mongoose.model(
    'Profile',
    ProfileSchema) as IProfileModel;
