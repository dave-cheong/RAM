import * as mongoose from 'mongoose';
import {ICodeDecode, CodeDecodeSchema, Model} from './base';

// enums, utilities, helpers ..........................................................................................

export const DOB_SHARED_SECRET_TYPE_CODE = 'DATE_OF_BIRTH';

// schema .............................................................................................................

const SharedSecretTypeSchema = CodeDecodeSchema({
    domain: {
        type: String,
        required: [true, 'Domain is required'],
        trim: true
    }
});

// exports ............................................................................................................

export interface ISharedSecretType extends ICodeDecode, ISharedSecretTypeInstanceContract {
}

export interface ISharedSecretTypeModel extends mongoose.Model<ISharedSecretType>, ISharedSecretTypeStaticContract {
}

export let SharedSecretTypeModel: ISharedSecretTypeModel;

// instance ...........................................................................................................

interface ISharedSecretTypeInstanceContract {
    domain: string;
    helloDomain(): string;
}

class SharedSecretTypeInstanceContractImpl implements ISharedSecretTypeInstanceContract {

    public domain: string;

    public helloDomain(): string {
        return 'hello ' + this.domain;
    }

}

// static .............................................................................................................

interface ISharedSecretTypeStaticContract {
    findByCodeIgnoringDateRange(code: string): mongoose.Promise<ISharedSecretType>;
    findByCodeInDateRange(code: string, date: Date): mongoose.Promise<ISharedSecretType>;
    listIgnoringDateRange(): mongoose.Promise<ISharedSecretType[]>;
    listInDateRange(date: Date): mongoose.Promise<ISharedSecretType[]>;
}

class SharedSecretTypeStaticContractImpl implements ISharedSecretTypeStaticContract {

    public findByCodeIgnoringDateRange(code: string): mongoose.Promise<ISharedSecretType> {
        return SharedSecretTypeModel
            .findOne({
                code: code
            })
            .exec();
    }

    public findByCodeInDateRange(code: string, date: Date): mongoose.Promise<ISharedSecretType> {
        return SharedSecretTypeModel
            .findOne({
                code: code,
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .exec();
    }

    public listIgnoringDateRange(): mongoose.Promise<ISharedSecretType[]> {
        return SharedSecretTypeModel
            .find({})
            .sort({name: 1})
            .exec();
    }

    public listInDateRange(date: Date): mongoose.Promise<ISharedSecretType[]> {
        return SharedSecretTypeModel
            .find({
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .sort({name: 1})
            .exec();
    }

}

// concrete model .....................................................................................................

SharedSecretTypeModel =
    Model(
        'SharedSecretType',
        SharedSecretTypeSchema,
        SharedSecretTypeInstanceContractImpl,
        SharedSecretTypeStaticContractImpl
    ) as ISharedSecretTypeModel;
