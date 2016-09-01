import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import {IRAMObject, RAMSchema, IRAMObjectContract, RAMObjectContractImpl, Model} from './base';
import {ISharedSecretType, SharedSecretTypeModel} from './sharedSecretType.model';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _SharedSecretTypeModel = SharedSecretTypeModel;

// mongoose ...........................................................................................................

let SharedSecretMongooseModel: mongoose.Model<ISharedSecretDocument>;

// enums, utilities, helpers ..........................................................................................

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

export interface ISharedSecret extends IRAMObjectContract {
    value: string;
    sharedSecretType: ISharedSecretType;
    matchesValue(candidateValue: string): boolean;
}

class SharedSecret extends RAMObjectContractImpl implements ISharedSecret {

    public value: string;
    public sharedSecretType: ISharedSecretType;

    public matchesValue(candidateValue: string): boolean {
        if (candidateValue && this.value) {
            return bcrypt.compareSync(candidateValue, this.value);
        }
        return false;
    }

}

interface ISharedSecretDocument extends ISharedSecret, mongoose.Document {

}

// static .............................................................................................................

export class SharedSecretModel {

    public static async add(value: string, sharedSecretType: ISharedSecretType): Promise<ISharedSecret> {
        return SharedSecretMongooseModel.create({
            value: value,
            sharedSecretType: sharedSecretType
        });
    }

}

// concrete model .....................................................................................................

SharedSecretMongooseModel = Model(
    'SharedSecret',
    SharedSecretSchema,
    SharedSecret
) as mongoose.Model<ISharedSecretDocument>;
