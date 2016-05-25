import * as mongoose from 'mongoose';
import {IRAMObject, RAMSchema} from './base';

/* tslint:disable:no-var-requires */
const mongooseIdValidator = require('mongoose-id-validator');

export const relationshipTypes = [
    'Business Representative',
    'Online Service Provider',
    'Insolvency practitioner',
    'Trusted Intermediary - tax agent, BAS Agent, Financial Advisor, Lawyer',
    'Intermediary – Real Estate Agent, Immigration Agent',
    'Importer Export Agent',
    'Doctor Patient',
    'Nominated Entity',
    'Power of Attorney (Voluntary)',
    'Power of Attorney (Involuntary)',
    'Executor of deceased estate',
    'Pharmaceutical',
    'Institution to student – relationship',
    'Training organisations (RTO)',
    'Parent - Child',
    'Employment Agents – employment'
];

export interface IRelationshipType extends IRAMObject {
    type: string;
}

const RelationshipTypeSchema = RAMSchema({

    type: {
        type: String,
        required: [true, 'Relationship Types have to have a type'],
        enum: relationshipTypes
    }

});

RelationshipTypeSchema.plugin(mongooseIdValidator);

export interface IRelationshipTypeModel extends mongoose.Model<IRelationshipType> {
    findValidById: (id:String) => mongoose.Promise<IRelationshipType>;
}

RelationshipTypeSchema.static('findValidById', (id:String) => {
    return this.RelationshipTypeModel
        .findOne({_id: id, deleteInd: false})
        .exec();
});

export const RelationshipTypeModel = mongoose.model('RelationshipType', RelationshipTypeSchema) as IRelationshipTypeModel;
