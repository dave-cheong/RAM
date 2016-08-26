import * as mongoose from 'mongoose';
import {IRAMObject, RAMSchema, Model} from './base';
import {
    HrefValue,
    Name as DTO
} from '../../../commons/RamAPI';

// enums, utilities, helpers ..........................................................................................

// exports ............................................................................................................

export interface IName extends IRAMObject, INameInstanceContract {
}

export interface INameModel extends mongoose.Model<IName>, INameStaticContract {
}

export let NameModel: INameModel;

// instance ...........................................................................................................

const NameSchema = RAMSchema({
    givenName: {
        type: String,
        trim: true,
        required: [function () {
            return this.familyName || !this.unstructuredName;
        }, 'Given Name or Unstructured Name is required']
    },
    familyName: {
        type: String,
        trim: true
    },
    unstructuredName: {
        type: String,
        trim: true,
        required: [function () {
            return !this.givenName && !this.familyName;
        }, 'Given Name or Unstructured Name is required']
    },
    _displayName: {
        type: String,
        trim: true,
        required: true
    }
});

NameSchema.pre('validate', function (next: () => void) {
    if ((this.givenName || this.familyName) && this.unstructuredName) {
        throw new Error('Given/Family Name and Unstructured Name cannot both be specified');
    } else {
        if (this.givenName) {
            this._displayName = this.givenName + (this.familyName ? ' ' + this.familyName : '');
        } else if (this.unstructuredName) {
            this._displayName = this.unstructuredName;
        }
        next();
    }
});

interface INameInstanceContract {
    givenName?: string;
    familyName?: string;
    unstructuredName?: string;
    _displayName?: string;
    toHrefValue(includeValue: boolean): Promise<HrefValue<DTO>>;
    toDTO(): Promise<DTO>;
}

class NameInstanceContractImpl implements INameInstanceContract {

    public givenName: string;
    public familyName: string;
    public unstructuredName: string;
    public _displayName: string;

    public async toHrefValue(includeValue: boolean): Promise<HrefValue<DTO>> {
        return new HrefValue(
            null, // TODO do these have endpoints?
            includeValue ? await this.toDTO() : undefined
        );
    }

    public async toDTO(): Promise<DTO> {
        return new DTO(
            this.givenName,
            this.familyName,
            this.unstructuredName,
            this._displayName
        );
    }

}

// static .............................................................................................................

interface INameStaticContract {
}

class NameStaticContractImpl implements INameStaticContract {
}

// concrete model .....................................................................................................

NameModel = Model(
    'Name',
    NameSchema,
    NameInstanceContractImpl,
    NameStaticContractImpl
) as INameModel;

