import * as mongoose from 'mongoose';
import {RAMSchema, IRAMObjectContract, RAMObjectContractImpl, Model} from './base';
import {IRoleAttributeName, RoleAttributeNameModel} from './roleAttributeName.model';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _RoleAttributeNameModel = RoleAttributeNameModel;

// mongoose ...........................................................................................................

let RoleAttributeNameUsageMongooseModel: mongoose.Model<IRoleAttributeNameUsageDocument>;

// enums, utilities, helpers ..........................................................................................

// schema .............................................................................................................

const RoleAttributeNameUsageSchema = RAMSchema({
    optionalInd: {
        type: Boolean,
        default: false,
        required: [true, 'Optional Indicator is required']
    },
    defaultValue: {
      type: String,
      required: false,
      trim: true
    },
    attributeName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoleAttributeName'
    }
});

// instance ...........................................................................................................

export interface IRoleAttributeNameUsage extends IRAMObjectContract {
    optionalInd: boolean;
    defaultValue?: string;
    attributeName: IRoleAttributeName;
}

class RoleAttributeNameUsage extends RAMObjectContractImpl implements IRoleAttributeNameUsage {

    public optionalInd: boolean;
    public defaultValue: string;
    public attributeName: IRoleAttributeName;

}

interface IRoleAttributeNameUsageDocument extends IRoleAttributeNameUsage, mongoose.Document {
}

// static .............................................................................................................

export class RoleAttributeNameUsageModel {

    public static async create(source: any): Promise<IRoleAttributeNameUsage> {
        return RoleAttributeNameUsageMongooseModel.create(source);
    }
}

// concrete model .....................................................................................................

RoleAttributeNameUsageMongooseModel = Model(
    'RoleAttributeNameUsage',
    RoleAttributeNameUsageSchema,
    RoleAttributeNameUsage
) as mongoose.Model<IRoleAttributeNameUsageDocument>;
