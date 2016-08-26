import * as mongoose from 'mongoose';
import {IRelationshipAttributeName, RelationshipAttributeNameModel} from './relationshipAttributeName.model';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _RelationshipAttributeNameModel = RelationshipAttributeNameModel;

// enums, utilities, helpers ..........................................................................................

// schema .............................................................................................................

const RelationshipAttributeNameUsageSchema = new mongoose.Schema({
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

// interfaces .........................................................................................................

export interface IRelationshipAttributeNameUsage extends mongoose.Document {
    optionalInd: boolean;
    defaultValue?: string;
    attributeName: IRelationshipAttributeName;
    sortOrder: number;
}

/* tslint:disable:no-empty-interfaces */
export interface IRelationshipAttributeNameUsageModel extends mongoose.Model<IRelationshipAttributeNameUsage> {
}

// instance methods ...................................................................................................

// static methods .....................................................................................................

// concrete model .....................................................................................................

export const RelationshipAttributeNameUsageModel = mongoose.model(
    'RelationshipAttributeNameUsage',
    RelationshipAttributeNameUsageSchema) as IRelationshipAttributeNameUsageModel;
