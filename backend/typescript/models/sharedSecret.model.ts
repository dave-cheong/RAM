import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import {IRAMObject, RAMSchema, Model} from './base';
import {ISharedSecretType, SharedSecretTypeModel} from './sharedSecretType.model';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _SharedSecretTypeModel = SharedSecretTypeModel;

// enums, utilities, helpers ..........................................................................................

// exports ............................................................................................................

export interface ISharedSecret extends IRAMObject, ISharedSecretInstanceContract {
}

export interface ISharedSecretModel extends mongoose.Model<ISharedSecret>, ISharedSecretStaticContract {
}

export let SharedSecretModel: ISharedSecretModel;

// schema .............................................................................................................

const SharedSecretSchema = RAMSchema({
    value: {
        type: String,
        required: [true, 'Value is required'],
        set: (value: String) => {
            if (value) {
                const salt = bcrypt.genSaltSync(10);
                return bcrypt.hashSync(value, salt);
            }
            return value;
        }
    },
    sharedSecretType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SharedSecretType',
        required: [true, 'Shared Secret Type is required']
    }
});

// instance ...........................................................................................................

interface ISharedSecretInstanceContract {
    value: string;
    sharedSecretType: ISharedSecretType;
    matchesValue(candidateValue: string): boolean;
}

class SharedSecretInstanceContractImpl implements ISharedSecretInstanceContract {

    public value: string;
    public sharedSecretType: ISharedSecretType;

    public matchesValue(candidateValue: string) {
        if (candidateValue && this.value) {
            return bcrypt.compareSync(candidateValue, this.value);
        }
        return false;
    }

}

// static .............................................................................................................

interface ISharedSecretStaticContract {
}

class SharedSecretStaticContractImpl implements ISharedSecretStaticContract {
}

// concrete model .....................................................................................................

SharedSecretModel = Model(
    'SharedSecret',
    SharedSecretSchema,
    SharedSecretInstanceContractImpl,
    SharedSecretStaticContractImpl
) as ISharedSecretModel;
