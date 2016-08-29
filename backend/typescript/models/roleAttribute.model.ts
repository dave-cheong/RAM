import * as mongoose from 'mongoose';
import {IRAMObject, RAMSchema, Model} from './base';
import {RoleModel} from './role.model';
import {IRoleAttributeName, RoleAttributeNameModel} from './roleAttributeName.model';
import {
    RoleAttribute as DTO
} from '../../../commons/RamAPI';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _RoleModel = RoleModel;

/* tslint:disable:no-unused-variable */
const _RoleAttributeNameModel = RoleAttributeNameModel;

// enums, utilities, helpers ..........................................................................................

// exports ............................................................................................................

export interface IRoleAttribute extends IRAMObject, IRoleAttributeInstanceContract {
}

export interface IRoleAttributeModel extends mongoose.Model<IRoleAttribute>, IRoleAttributeStaticContract {
}

export let RoleAttributeModel: IRoleAttributeModel;

// schema .............................................................................................................

const RoleAttributeSchema = RAMSchema({
    value: {
        type: [String],
        required: false,
        trim: true
    },
    attributeName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoleAttributeName',
        required: true
    }
});

// instance ...........................................................................................................

interface IRoleAttributeInstanceContract {
    value: string[];
    attributeName: IRoleAttributeName;
    toDTO(): Promise<DTO>;
}

class RoleAttributeInstanceContractImpl implements IRoleAttributeInstanceContract {

    public value: string[];
    public attributeName: IRoleAttributeName;

    public async toDTO(): Promise<DTO> {
        return new DTO(
            this.value,
            await this.attributeName.toHrefValue(true)
        );
    }

}

// static .............................................................................................................

interface IRoleAttributeStaticContract {
}

class RoleAttributeStaticContractImpl implements IRoleAttributeStaticContract {
}

// concrete model .....................................................................................................

RoleAttributeModel = Model(
    'RoleAttribute',
    RoleAttributeSchema,
    RoleAttributeInstanceContractImpl,
    RoleAttributeStaticContractImpl
) as IRoleAttributeModel;
