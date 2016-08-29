import * as mongoose from 'mongoose';
import {RAMEnum, ICodeDecode, CodeDecodeSchema, ICodeDecodeContract, CodeDecodeContractImpl, Model} from './base';
import {Url} from './url';
import {HrefValue, RoleAttributeName as DTO} from '../../../commons/RamAPI';

// exports ............................................................................................................

export interface IRoleAttributeName extends ICodeDecode, IRoleAttributeNameInstanceContract {
}

export interface IRoleAttributeNameModel extends mongoose.Model<IRoleAttributeName>, IRoleAttributeNameStaticContract {
}

export let RoleAttributeNameModel: IRoleAttributeNameModel;

// enums, utilities, helpers ..........................................................................................

// see https://github.com/atogov/RAM/wiki/Role-Attribute-Types
export class RoleAttributeNameDomain extends RAMEnum {

    public static Null = new RoleAttributeNameDomain('NULL', 'NULL');
    public static Boolean = new RoleAttributeNameDomain('BOOLEAN', 'BOOLEAN');
    public static Number = new RoleAttributeNameDomain('NUMBER', 'NUMBER');
    public static String = new RoleAttributeNameDomain('STRING', 'STRING');
    public static Date = new RoleAttributeNameDomain('DATE', 'DATE');
    public static Markdown = new RoleAttributeNameDomain('MARKDOWN', 'MARKDOWN');
    public static SelectSingle = new RoleAttributeNameDomain('SELECT_SINGLE', 'SELECT_SINGLE');
    public static SelectMulti = new RoleAttributeNameDomain('SELECT_MULTI', 'SELECT_MULTI');

    protected static AllValues = [
        RoleAttributeNameDomain.Null,
        RoleAttributeNameDomain.Boolean,
        RoleAttributeNameDomain.Number,
        RoleAttributeNameDomain.String,
        RoleAttributeNameDomain.Date,
        RoleAttributeNameDomain.Markdown,
        RoleAttributeNameDomain.SelectSingle,
        RoleAttributeNameDomain.SelectMulti
    ];

    constructor(code:string, shortDecodeText:string) {
        super(code, shortDecodeText);
    }
}

export class RoleAttributeNameClassifier extends RAMEnum {

    public static AgencyService = new RoleAttributeNameClassifier('AGENCY_SERVICE', 'Agency Service');
    public static Other = new RoleAttributeNameClassifier('OTHER', 'Other');
    public static Permission = new RoleAttributeNameClassifier('PERMISSION', 'Permission');

    protected static AllValues = [
        RoleAttributeNameClassifier.AgencyService,
        RoleAttributeNameClassifier.Other,
        RoleAttributeNameClassifier.Permission
    ];

    constructor(code:string, shortDecodeText:string) {
        super(code, shortDecodeText);
    }
}

// schema .............................................................................................................

const RoleAttributeNameSchema = CodeDecodeSchema({
    domain: {
        type: String,
        required: [true, 'Domain is required'],
        trim: true,
        enum: RoleAttributeNameDomain.valueStrings()
    },
    classifier: {
        type: String,
        required: [true, 'Classifier is required'],
        trim: true,
        enum: RoleAttributeNameClassifier.valueStrings()
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

interface IRoleAttributeNameInstanceContract extends ICodeDecodeContract {
    domain: string;
    classifier: string;
    category?: string;
    purposeText: string;
    permittedValues: string[];
    domainEnum(): RoleAttributeNameDomain;
    isInDateRange(): boolean;
    toHrefValue(includeValue:boolean): Promise<HrefValue<DTO>>;
    toDTO(): Promise<DTO>;
}

class RoleAttributeNameInstanceContractImpl extends CodeDecodeContractImpl implements IRoleAttributeNameInstanceContract {

    public domain: string;
    public classifier: string;
    public category: string;
    public purposeText: string;
    public permittedValues: string[];

    public domainEnum(): RoleAttributeNameDomain {
        return RoleAttributeNameDomain.valueOf(this.domain);
    }

    public isInDateRange(): boolean {
        const date = new Date();
        return this.startDate <= date && (this.endDate === null || this.endDate === undefined || this.endDate >= date);
    }

    public async toHrefValue(includeValue:boolean): Promise<HrefValue<DTO>> {
        return new HrefValue(
            await Url.forRoleAttributeName(this as IRoleAttributeName),
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

// static .............................................................................................................

interface IRoleAttributeNameStaticContract {
    findByCodeIgnoringDateRange(code: string): Promise<IRoleAttributeName>;
    findByCodeInDateRange(code: string, date: Date): Promise<IRoleAttributeName>;
    listIgnoringDateRange(): Promise<IRoleAttributeName[]>;
    listInDateRange(date: Date): Promise<IRoleAttributeName[]>;
}

class RoleAttributeNameStaticContractImpl implements IRoleAttributeNameStaticContract {

    public findByCodeIgnoringDateRange(code: string): Promise<IRoleAttributeName> {
        return RoleAttributeNameModel
            .findOne({
                code: code
            })
            .exec();
    }

    public findByCodeInDateRange(code: string, date: Date): Promise<IRoleAttributeName> {
        return RoleAttributeNameModel
            .findOne({
                code: code,
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .exec();
    }

    public listIgnoringDateRange(): Promise<IRoleAttributeName[]> {
        return RoleAttributeNameModel
            .find({})
            .sort({name: 1})
            .exec();
    }

    public listInDateRange(date: Date): Promise<IRoleAttributeName[]> {
        return RoleAttributeNameModel
            .find({
                startDate: {$lte: date},
                $or: [{endDate: null}, {endDate: {$gte: date}}]
            })
            .sort({name: 1})
            .exec();
    }

}

// concrete model .....................................................................................................

RoleAttributeNameModel = Model(
    'RoleAttributeName',
    RoleAttributeNameSchema,
    RoleAttributeNameInstanceContractImpl,
    RoleAttributeNameStaticContractImpl
) as IRoleAttributeNameModel;
