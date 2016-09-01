import * as mongoose from 'mongoose';
import {CodeDecodeSchema, Model, ICodeDecodeContract, CodeDecodeContractImpl} from './base';

// mongoose ...........................................................................................................

let LegislativeProgramMongooseModel: mongoose.Model<ILegislativeProgramDocument>;

// enums, utilities, helpers ..........................................................................................

// schema .............................................................................................................

const LegislativeProgramSchema = CodeDecodeSchema({});

// instance ...........................................................................................................

export interface ILegislativeProgram extends ICodeDecodeContract {
}

class LegislativeProgram extends CodeDecodeContractImpl implements ILegislativeProgram {
}

interface ILegislativeProgramDocument extends ILegislativeProgram, mongoose.Document {
}

// static .............................................................................................................

export class LegislativeProgramModel {

    public static async create(source: any): Promise<ILegislativeProgram> {
        return LegislativeProgramMongooseModel.create(source);
    }

    public static findByCodeIgnoringDateRange(code: string): Promise<ILegislativeProgram> {
        return LegislativeProgramMongooseModel
            .findOne({
                code: code
            })
            .exec();
    }

    public static findByCodeInDateRange(code: string, date: Date): Promise<ILegislativeProgram> {
        return LegislativeProgramMongooseModel
            .findOne({
                code: code,
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .exec();
    }

    public static listIgnoringDateRange(): Promise<ILegislativeProgram[]> {
        return LegislativeProgramMongooseModel
            .find({})
            .sort({shortDecodeText: 1})
            .exec();
    }

    public static listInDateRange(date: Date): Promise<ILegislativeProgram[]> {
        return LegislativeProgramMongooseModel
            .find({
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .sort({shortDecodeText: 1})
            .exec();
    }

}

// concrete model .....................................................................................................

LegislativeProgramMongooseModel = Model(
    'LegislativeProgram',
    LegislativeProgramSchema,
    LegislativeProgram
) as mongoose.Model<ILegislativeProgramDocument>;
