import * as mongoose from 'mongoose';
import {ICodeDecode, CodeDecodeSchema, Model} from './base';

// enums, utilities, helpers ..........................................................................................

// exports ............................................................................................................

export interface ILegislativeProgram extends ICodeDecode, ILegislativeProgramInstanceContract {
}

export interface ILegislativeProgramModel extends mongoose.Model<ILegislativeProgram>, ILegislativeProgramStaticContract {
}

export let LegislativeProgramModel: ILegislativeProgramModel;

// schema .............................................................................................................

const LegislativeProgramSchema = CodeDecodeSchema({});

// instance ...........................................................................................................

export interface ILegislativeProgramInstanceContract {
}

class LegislativeProgramInstanceContractImpl implements ILegislativeProgramInstanceContract {
}

// static .............................................................................................................

interface ILegislativeProgramStaticContract {
    findByCodeIgnoringDateRange: (code: String) => mongoose.Promise<ILegislativeProgram>;
    findByCodeInDateRange: (code: String, date: Date) => mongoose.Promise<ILegislativeProgram>;
    listIgnoringDateRange: () => mongoose.Promise<ILegislativeProgram[]>;
    listInDateRange: (date: Date) => mongoose.Promise<ILegislativeProgram[]>;
}

class LegislativeProgramStaticContractImpl implements ILegislativeProgramStaticContract {

    public findByCodeIgnoringDateRange(code: string): mongoose.Promise<ILegislativeProgram> {
        return LegislativeProgramModel
            .findOne({
                code: code
            })
            .exec();
    }

    public findByCodeInDateRange(code: string, date: Date): mongoose.Promise<ILegislativeProgram> {
        return LegislativeProgramModel
            .findOne({
                code: code,
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .exec();
    }

    public listIgnoringDateRange(): mongoose.Promise<ILegislativeProgram[]> {
        return LegislativeProgramModel
            .find({})
            .sort({shortDecodeText: 1})
            .exec();
    }

    public listInDateRange(date: Date): mongoose.Promise<ILegislativeProgram[]> {
        return LegislativeProgramModel
            .find({
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .sort({shortDecodeText: 1})
            .exec();
    }

}

// concrete model .....................................................................................................

LegislativeProgramModel =
    Model(
        'LegislativeProgram',
        LegislativeProgramSchema,
        LegislativeProgramInstanceContractImpl,
        LegislativeProgramStaticContractImpl
    ) as ILegislativeProgramModel;
