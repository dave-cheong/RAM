import * as mongoose from 'mongoose';
import {ICodeDecode, ICodeDecodeContract, CodeDecodeContractImpl, CodeDecodeSchema, Model} from './base';
import {Url} from './url';
import {RoleAttributeNameModel} from './roleAttributeName.model';
import {IRoleAttributeNameUsage, RoleAttributeNameUsageModel} from './roleAttributeNameUsage.model';
import {
    HrefValue,
    RoleType as DTO,
    RoleAttributeNameUsage as RoleAttributeNameUsageDTO
} from '../../../commons/RamAPI';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _RoleAttributeNameModel = RoleAttributeNameModel;

/* tslint:disable:no-unused-variable */
const _RoleAttributeNameUsageModel = RoleAttributeNameUsageModel;

// exports ............................................................................................................

export interface IRoleType extends ICodeDecode, IRoleTypeInstanceContract {
}

export interface IRoleTypeModel extends mongoose.Model<IRoleType>, IRoleTypeStaticContract {
}

export let RoleTypeModel: IRoleTypeModel;

// enums, utilities, helpers ..........................................................................................

// schema .............................................................................................................

const RoleTypeSchema = CodeDecodeSchema({
    attributeNameUsages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoleAttributeNameUsage'
    }]
});

// instance ...........................................................................................................

export interface IRoleTypeInstanceContract extends ICodeDecodeContract {
    attributeNameUsages: IRoleAttributeNameUsage[];
    toHrefValue(includeValue: boolean): Promise<HrefValue<DTO>>;
    toDTO(): Promise<DTO>;
}

class RoleTypeInstanceContractImpl extends CodeDecodeContractImpl implements IRoleTypeInstanceContract {

    public attributeNameUsages: IRoleAttributeNameUsage[];

    public async toHrefValue(includeValue: boolean): Promise<HrefValue<DTO>> {
        return new HrefValue(
            await Url.forRoleType(this),
            includeValue ? await this.toDTO() : undefined
        );
    };

    public async toDTO() {
        return new DTO(
            this.code,
            this.shortDecodeText,
            this.longDecodeText,
            this.startDate,
            this.endDate,
            await Promise.all<RoleAttributeNameUsageDTO>(this.attributeNameUsages.map(
                async(attributeNameUsage: IRoleAttributeNameUsage) => {
                    return new RoleAttributeNameUsageDTO(
                        attributeNameUsage.optionalInd,
                        attributeNameUsage.defaultValue,
                        await attributeNameUsage.attributeName.toHrefValue(true)
                    );
                }))
        );
    };

}

// static .............................................................................................................

export interface IRoleTypeStaticContract {
    findByCodeIgnoringDateRange(code: String): Promise<IRoleType>;
    findByCodeInDateRange(code: String, date: Date): Promise<IRoleType>;
    listIgnoringDateRange(): Promise<IRoleType[]>;
    listInDateRange(date: Date): Promise<IRoleType[]>;
}

class RoleTypeStaticContractImpl implements IRoleTypeStaticContract {

    public findByCodeIgnoringDateRange(code: String): Promise<IRoleType> {
        return RoleTypeModel
            .findOne({
                code: code
            })
            .deepPopulate([
                'attributeNameUsages.attributeName'
            ])
            .exec();
    }

    public findByCodeInDateRange(code: String, date: Date): Promise<IRoleType> {
        return RoleTypeModel
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

    public listIgnoringDateRange(): Promise<IRoleType[]> {
        return RoleTypeModel
            .find({})
            .deepPopulate([
                'attributeNameUsages.attributeName'
            ])
            .sort({shortDecodeText: 1})
            .exec();
    }

    public listInDateRange(date: Date): Promise<IRoleType[]> {
        return RoleTypeModel
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

RoleTypeModel = Model(
    'RoleType',
    RoleTypeSchema,
    RoleTypeInstanceContractImpl,
    RoleTypeStaticContractImpl
) as IRoleTypeModel;
