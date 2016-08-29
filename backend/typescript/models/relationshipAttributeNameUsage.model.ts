import * as mongoose from 'mongoose';
import {RAMSchema, IRAMObject, IRAMObjectContract, RAMObjectContractImpl, Model} from './base';
import {IRelationshipAttributeName, RelationshipAttributeNameModel} from './relationshipAttributeName.model';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _RelationshipAttributeNameModel = RelationshipAttributeNameModel;

// exports ............................................................................................................

export interface IRelationshipAttributeNameUsage extends IRAMObject, IRelationshipAttributeNameUsageInstanceContract {
}

export interface IRelationshipAttributeNameUsageModel extends mongoose.Model<IRelationshipAttributeNameUsage>, IRelationshipAttributeNameUsageStaticContract {
}

export let RelationshipAttributeNameUsageModel: IRelationshipAttributeNameUsageModel;

// enums, utilities, helpers ..........................................................................................

// schema .............................................................................................................

const RelationshipAttributeNameUsageSchema = RAMSchema({
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
        ref: 'RelationshipAttributeName'
    },
    sortOrder : {
        type: Number,
        required: true
    }
});

// instance ...........................................................................................................

interface IRelationshipAttributeNameUsageInstanceContract extends IRAMObjectContract {
    optionalInd: boolean;
    defaultValue?: string;
    attributeName: IRelationshipAttributeName;
    sortOrder: number;
}

class RelationshipAttributeNameUsageInstanceContractImpl extends RAMObjectContractImpl implements IRelationshipAttributeNameUsageInstanceContract {

    public optionalInd: boolean;
    public defaultValue: string;
    public attributeName: IRelationshipAttributeName;
    public sortOrder: number;

}

// static .............................................................................................................

interface IRelationshipAttributeNameUsageStaticContract {
}

class RelationshipAttributeNameUsageStaticContractImpl implements IRelationshipAttributeNameUsageStaticContract {
}

// concrete model .....................................................................................................

RelationshipAttributeNameUsageModel = Model(
    'RelationshipAttributeNameUsage',
    RelationshipAttributeNameUsageSchema,
    RelationshipAttributeNameUsageInstanceContractImpl,
    RelationshipAttributeNameUsageStaticContractImpl
) as IRelationshipAttributeNameUsageModel;
