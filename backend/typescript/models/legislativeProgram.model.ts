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
    findByCodeIgnoringDateRange(code: String): Promise<ILegislativeProgram>;
    findByCodeInDateRange(code: String, date: Date): Promise<ILegislativeProgram>;
    listIgnoringDateRange(): Promise<ILegislativeProgram[]>;
    listInDateRange(date: Date): Promise<ILegislativeProgram[]>;
}

class LegislativeProgramStaticContractImpl implements ILegislativeProgramStaticContract {

    public findByCodeIgnoringDateRange(code: string): Promise<ILegislativeProgram> {
        return LegislativeProgramModel
            .findOne({
                code: code
            })
            .exec() as Promise;
    }

    public findByCodeInDateRange(code: string, date: Date): Promise<ILegislativeProgram> {
        return LegislativeProgramModel
            .findOne({
                code: code,
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .exec() as Promise;
    }

    public listIgnoringDateRange(): Promise<ILegislativeProgram[]> {
        return LegislativeProgramModel
            .find({})
            .sort({shortDecodeText: 1})
            .exec() as Promise;
    }

    public listInDateRange(date: Date): Promise<ILegislativeProgram[]> {
        return LegislativeProgramModel
            .find({
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .sort({shortDecodeText: 1})
            .exec() as Promise;
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
