import * as mongoose from 'mongoose';
import {ICodeDecode, CodeDecodeSchema, ICodeDecodeContract, CodeDecodeContractImpl, Model} from './base';
import {IRoleAttributeName, RoleAttributeNameModel} from './roleAttributeName.model';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _RoleAttributeNameModel = RoleAttributeNameModel;

// exports ............................................................................................................

export interface IRoleAttributeNameUsage extends ICodeDecode, IRoleAttributeNameUsageInstanceContract {
}

export interface IRoleAttributeNameUsageModel extends mongoose.Model<IRoleAttributeNameUsage>, IRoleAttributeNameUsageStaticContract {
}

export let RoleAttributeNameUsageModel: IRoleAttributeNameUsageModel;

// enums, utilities, helpers ..........................................................................................

// schema .............................................................................................................

const RoleAttributeNameUsageSchema = new mongoose.Schema({
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

interface IRoleAttributeNameUsageInstanceContract extends ICodeDecodeContract {
    optionalInd: boolean;
    defaultValue?: string;
    attributeName: IRoleAttributeName;
}

class RoleAttributeNameUsageInstanceContractImpl extends CodeDecodeContractImpl implements IRoleAttributeNameUsageInstanceContract {

    public optionalInd: boolean;
    public defaultValue: string;
    public attributeName: IRoleAttributeName;

}

// static .............................................................................................................

interface IRoleAttributeNameUsageStaticContract {
}

class RoleAttributeNameUsageStaticContractImpl implements IRoleAttributeNameUsageStaticContract {
}

// concrete model .....................................................................................................

RoleAttributeNameUsageModel = Model(
    'RoleAttributeNameUsage',
    RoleAttributeNameUsageSchema,
    RoleAttributeNameUsageInstanceContractImpl,
    RoleAttributeNameUsageStaticContractImpl
) as IRoleAttributeNameUsageModel;
