import * as mongoose from 'mongoose';
import {RAMEnum, ICodeDecode, CodeDecodeSchema, ICodeDecodeContract, CodeDecodeContractImpl, Model} from './base';
import {Url} from './url';
import {HrefValue, RelationshipAttributeName as DTO} from '../../../commons/RamAPI';

// exports ............................................................................................................

export interface IRelationshipAttributeName extends ICodeDecode, IRelationshipAttributeNameInstanceContract {
}

export interface IRelationshipAttributeNameModel extends mongoose.Model<IRelationshipAttributeName>, IRelationshipAttributeNameStaticContract {
}

export let RelationshipAttributeNameModel: IRelationshipAttributeNameModel;

// enums, utilities, helpers ..........................................................................................

// see https://github.com/atogov/RAM/wiki/Relationship-Attribute-Types
export class RelationshipAttributeNameDomain extends RAMEnum {

    public static Null = new RelationshipAttributeNameDomain('NULL', 'NULL');
    public static Boolean = new RelationshipAttributeNameDomain('BOOLEAN', 'BOOLEAN');
    public static Number = new RelationshipAttributeNameDomain('NUMBER', 'NUMBER');
    public static String = new RelationshipAttributeNameDomain('STRING', 'STRING');
    public static Date = new RelationshipAttributeNameDomain('DATE', 'DATE');
    public static Markdown = new RelationshipAttributeNameDomain('MARKDOWN', 'MARKDOWN');
    public static SelectSingle = new RelationshipAttributeNameDomain('SELECT_SINGLE', 'SELECT_SINGLE');
    public static SelectMulti = new RelationshipAttributeNameDomain('SELECT_MULTI', 'SELECT_MULTI');

    protected static AllValues = [
        RelationshipAttributeNameDomain.Null,
        RelationshipAttributeNameDomain.Boolean,
        RelationshipAttributeNameDomain.Number,
        RelationshipAttributeNameDomain.String,
        RelationshipAttributeNameDomain.Date,
        RelationshipAttributeNameDomain.Markdown,
        RelationshipAttributeNameDomain.SelectSingle,
        RelationshipAttributeNameDomain.SelectMulti
    ];

    constructor(code:string, shortDecodeText:string) {
        super(code, shortDecodeText);
    }
}

export class RelationshipAttributeNameClassifier extends RAMEnum {

    public static Other = new RelationshipAttributeNameClassifier('OTHER', 'Other');
    public static Permission = new RelationshipAttributeNameClassifier('PERMISSION', 'Permission');
    public static AgencyService = new RelationshipAttributeNameClassifier('AGENCY_SERVICE', 'Agency Service');

    protected static AllValues = [
        RelationshipAttributeNameClassifier.Other,
        RelationshipAttributeNameClassifier.Permission,
        RelationshipAttributeNameClassifier.AgencyService
    ];

    constructor(code:string, shortDecodeText:string) {
        super(code, shortDecodeText);
    }
}

// schema .............................................................................................................

const RelationshipAttributeNameSchema = CodeDecodeSchema({
    domain: {
        type: String,
        required: [true, 'Domain is required'],
        trim: true,
        enum: RelationshipAttributeNameDomain.valueStrings()
    },
    classifier: {
        type: String,
        required: [true, 'Classifier is required'],
        trim: true,
        enum: RelationshipAttributeNameClassifier.valueStrings()
    },
    category: {
        type: String,
        trim: true
    },
    purposeText: {
        type: String,
        required: [true, 'Purpose Text is required'],
        trim: true
    },
    permittedValues: [{
        type: String
    }]
});

// instance ...........................................................................................................

interface IRelationshipAttributeNameInstanceContract extends ICodeDecodeContract {
    domain: string;
    classifier: string;
    category?: string;
    purposeText: string;
    permittedValues: string[];
    domainEnum(): RelationshipAttributeNameDomain;
    isInDateRange(): boolean;
    toHrefValue(includeValue:boolean): Promise<HrefValue<DTO>>;
    toDTO(): Promise<DTO>;
}

class RelationshipAttributeNameInstanceContractImpl extends CodeDecodeContractImpl implements IRelationshipAttributeNameInstanceContract {

    public domain: string;
    public classifier: string;
    public category: string;
    public purposeText: string;
    public permittedValues: string[];

    public domainEnum(): RelationshipAttributeNameDomain {
        return RelationshipAttributeNameDomain.valueOf(this.domain);
    }

    public isInDateRange(): boolean {
        const date = new Date();
        return this.startDate <= date && (this.endDate === null || this.endDate === undefined || this.endDate >= date);
    }

    public async toHrefValue(includeValue:boolean): Promise<HrefValue<DTO>> {
        return new HrefValue(
            await Url.forRelationshipAttributeName(this as IRelationshipAttributeName),
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
            this.shortDecodeText,
            this.domain,
            this.classifier,
            this.category,
            this.permittedValues
        );
    }

}

// interfaces .........................................................................................................

export interface IRelationshipAttributeName extends ICodeDecode {
    domain: string;
    classifier: string;
    category?: string;
    purposeText: string;
    permittedValues: string[];
    domainEnum(): RelationshipAttributeNameDomain;
    toHrefValue(includeValue:boolean): Promise<HrefValue<DTO>>;
    toDTO(): Promise<DTO>;
}

export interface IRelationshipAttributeNameModel extends mongoose.Model<IRelationshipAttributeName> {
    findByCodeIgnoringDateRange: (code:string) => Promise<IRelationshipAttributeName>;
    findByCodeInDateRange: (code:string, date:Date) => Promise<IRelationshipAttributeName>;
    listIgnoringDateRange: () => Promise<IRelationshipAttributeName[]>;
    listInDateRange: (date:Date) => Promise<IRelationshipAttributeName[]>;
}

// static .............................................................................................................

interface IRelationshipAttributeNameStaticContract {
    findByCodeIgnoringDateRange(code: string): Promise<IRelationshipAttributeName>;
    findByCodeInDateRange(code: string, date: Date): Promise<IRelationshipAttributeName>;
    listIgnoringDateRange(): Promise<IRelationshipAttributeName[]>;
    listInDateRange(date: Date): Promise<IRelationshipAttributeName[]>;
}

class RelationshipAttributeNameStaticContractImpl implements IRelationshipAttributeNameStaticContract {

    public findByCodeIgnoringDateRange(code: string): Promise<IRelationshipAttributeName> {
        return RelationshipAttributeNameModel
            .findOne({
                code: code
            })
            .exec();
    }

    public findByCodeInDateRange(code: string, date: Date): Promise<IRelationshipAttributeName> {
        return RelationshipAttributeNameModel
            .findOne({
                code: code,
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .exec();
    }

    public listIgnoringDateRange(): Promise<IRelationshipAttributeName[]> {
        return RelationshipAttributeNameModel
            .find({})
            .sort({name: 1})
            .exec();
    }

    public listInDateRange(date: Date): Promise<IRelationshipAttributeName[]> {
        return RelationshipAttributeNameModel
            .find({
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .sort({name: 1})
            .exec();
    }

}

// concrete model .....................................................................................................

RelationshipAttributeNameModel = Model(
    'RelationshipAttributeName',
    RelationshipAttributeNameSchema,
    RelationshipAttributeNameInstanceContractImpl,
    RelationshipAttributeNameStaticContractImpl
) as IRelationshipAttributeNameModel;
