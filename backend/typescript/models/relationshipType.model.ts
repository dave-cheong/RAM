import * as mongoose from 'mongoose';
import {RAMEnum, CodeDecodeSchema, ICodeDecodeContract, CodeDecodeContractImpl, Model} from './base';
import {Url} from './url';
import {RelationshipAttributeNameModel} from './relationshipAttributeName.model';
import {IRelationshipAttributeNameUsage, RelationshipAttributeNameUsageModel} from './relationshipAttributeNameUsage.model';
import {
    HrefValue,
    RelationshipType as DTO,
    RelationshipAttributeNameUsage as RelationshipAttributeNameUsageDTO
} from '../../../commons/RamAPI';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _RelationshipAttributeNameModel = RelationshipAttributeNameModel;

/* tslint:disable:no-unused-variable */
const _RelationshipAttributeNameUsageModel = RelationshipAttributeNameUsageModel;

// mongoose ...........................................................................................................

let RelationshipTypeMongooseModel: mongoose.Model<IRelationshipTypeDocument>;

// enums, utilities, helpers ..........................................................................................

export class RelationshipTypeCategory extends RAMEnum {

    public static Authorisation = new RelationshipTypeCategory('AUTHORISATION', 'Authorisation');
    public static Notification = new RelationshipTypeCategory('NOTIFICATION', 'Notification');

    protected static AllValues = [
        RelationshipTypeCategory.Authorisation,
        RelationshipTypeCategory.Notification
    ];

    constructor(code: string, shortDecodeText: string) {
        super(code, shortDecodeText);
    }
}

// schema .............................................................................................................

const RelationshipTypeSchema = CodeDecodeSchema({
    minCredentialStrength: {
        type: Number,
        required: [true, 'Min Credential Strength is required'],
        default: 0
    },
    minIdentityStrength: {
        type: Number,
        required: [true, 'Min Identity Strength is required'],
        default: 0
    },
    voluntaryInd: {
        type: Boolean,
        required: [true, 'Voluntary Ind is required'],
        default: false
    },
    managedExternallyInd: {
        type: Boolean,
        required: [true, 'Managed Externally Ind is required'],
        default: false
    },
    autoAcceptIfInitiatedFromDelegate: {
        type: Boolean,
        required: [true, 'Auto-Accept If Initiated From Delegate is required'],
        default: false
    },
    autoAcceptIfInitiatedFromSubject: {
        type: Boolean,
        required: [true, 'Auto-Accept If Initiated From Subject is required'],
        default: false
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        enum: RelationshipTypeCategory.valueStrings()
    },
    attributeNameUsages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RelationshipAttributeNameUsage'
    }]
});

// interfaces .........................................................................................................

export interface IRelationshipType extends ICodeDecodeContract {
    minCredentialStrength: number;
    minIdentityStrength: number;
    voluntaryInd: boolean;
    managedExternallyInd: boolean;
    autoAcceptIfInitiatedFromDelegate: boolean;
    autoAcceptIfInitiatedFromSubject: boolean;
    category: string;
    attributeNameUsages: IRelationshipAttributeNameUsage[];
    categoryEnum(): RelationshipTypeCategory;
    findAttributeNameUsageByCode(code: string): IRelationshipAttributeNameUsage;
    toHrefValue(includeValue: boolean): Promise<HrefValue<DTO>>;
    toDTO(): Promise<DTO>;
}

class RelationshipType extends CodeDecodeContractImpl implements IRelationshipType {
    public minCredentialStrength: number;
    public minIdentityStrength: number;
    public voluntaryInd: boolean;
    public managedExternallyInd: boolean;
    public autoAcceptIfInitiatedFromDelegate: boolean;
    public autoAcceptIfInitiatedFromSubject: boolean;
    public category: string;
    public attributeNameUsages: IRelationshipAttributeNameUsage[];

    public categoryEnum(): RelationshipTypeCategory {
        return RelationshipTypeCategory.valueOf(this.category);
    }

    public findAttributeNameUsageByCode(code: string): IRelationshipAttributeNameUsage {
        for (let attributeNameUsage of this.attributeNameUsages) {
            if (attributeNameUsage.attributeName.code === code) {
                return attributeNameUsage;
            }
        }
        return null;
    }

    public async toHrefValue(includeValue: boolean): Promise<HrefValue<DTO>> {
        return new HrefValue(
            await Url.forRelationshipType(this),
            includeValue ? await this.toDTO() : undefined
        );
    }

    public async toDTO(): Promise<DTO> {
        return new DTO(
            this.code,
            this.shortDecodeText,
            this.longDecodeText,
            this.startDate,
            this.endDate,
            this.minCredentialStrength,
            this.minIdentityStrength,
            this.voluntaryInd,
            this.managedExternallyInd,
            this.category,
            await Promise.all<RelationshipAttributeNameUsageDTO>(this.attributeNameUsages.map(
                async(attributeNameUsage: IRelationshipAttributeNameUsage) => {
                    return new RelationshipAttributeNameUsageDTO(
                        attributeNameUsage.optionalInd,
                        attributeNameUsage.defaultValue,
                        await attributeNameUsage.attributeName.toHrefValue(true),
                        attributeNameUsage.sortOrder
                    );
                }))
        );
    }

}

interface IRelationshipTypeDocument extends IRelationshipType, mongoose.Document {
}

// static .............................................................................................................

export class RelationshipTypeModel {

    public static async create(source: any): Promise<IRelationshipType> {
        return RelationshipTypeMongooseModel.create(source);
    }

    public static findByCodeIgnoringDateRange(code: String): Promise<IRelationshipType> {
        return RelationshipTypeMongooseModel
            .findOne({
                code: code
            })
            .deepPopulate([
                'attributeNameUsages.attributeName'
            ])
            .exec();
    }

    public static findByCodeInDateRange(code: String, date: Date): Promise<IRelationshipType> {
        return RelationshipTypeMongooseModel
            .findOne({
                code: code,
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .deepPopulate([
                'attributeNameUsages.attributeName'
            ])
            .exec();
    }

    public static listIgnoringDateRange(): Promise<IRelationshipType[]> {
        return RelationshipTypeMongooseModel
            .find({})
            .deepPopulate([
                'attributeNameUsages.attributeName'
            ])
            .sort({shortDecodeText: 1})
            .exec();
    }

    public static listInDateRange(date: Date): Promise<IRelationshipType[]> {
        return RelationshipTypeMongooseModel
            .find({
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .deepPopulate([
                'attributeNameUsages.attributeName'
            ])
            .sort({shortDecodeText: 1})
            .exec();
    }

}

// concrete model .....................................................................................................

RelationshipTypeMongooseModel = Model(
    'RelationshipType',
    RelationshipTypeSchema,
    RelationshipType
) as mongoose.Model<IRelationshipTypeDocument>;
