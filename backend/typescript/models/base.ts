import * as mongoose from 'mongoose';
import {logger} from '../logger';
import * as _ from 'lodash';

/* tslint:disable:no-var-requires */
const mongooseUniqueValidator = require('mongoose-unique-validator');
/* tslint:disable:no-var-requires */
const mongooseIdValidator = require('mongoose-id-validator');
/* tslint:disable:no-var-requires */
const mongooseDeepPopulate = require('mongoose-deep-populate')(mongoose);

/**
 * A convenience class to build a query object, only adding criteria when specified.
 */
export class Query {

    private data: {[name: string]: Promise<Object>} = {};

    /**
     * Adds the given filter (name:value) only if 'condition' is truthy.
     */
    public when(condition: Object, name: string, callback: () => Promise<Object>) {
        if (condition) {
            this.data[name] = callback();
        }
        return this;
    }

    public async build(): Promise<Object> {
        try {
            const promises = Object.keys(this.data).map(val => this.data[val]);
            const values: Object[] = await Promise.all<Object>(promises);

            let i = 0;
            let result: {[name: string]: Object} = {};
            for (let key of Object.keys(this.data)) {
                result[key] = values[i];
                i = i + 1;
            }

            return result;

        } catch (e) {
            throw e;
        }
    }
}

/* RAMEnum is a simple class construct that represents a enumerated type so we can work with classes not strings.
 */
export class RAMEnum {

    protected static AllValues: RAMEnum[];

    public static values<T extends RAMEnum>(): T[] {
        return this.AllValues as T[];
    }

    public static valueStrings<T extends RAMEnum>(): string[] {
        return this.AllValues.map((value: T) => value.code);
    }

    public static valueOf<T extends RAMEnum>(code: string): T {
        for (let type of this.AllValues) {
            if ((type as T).code === code) {
                return type as T;
            }
        }
        return null;
    }

    constructor(public code: string, public shortDecodeText: string) {
    }
}

/* A RAMObject defines the common attributes that all objects in the RAM
 * model will contain.
 * Most objects in RAM extend off the RAMObject
 */
//noinspection ReservedWordAsName
export interface IRAMObject extends mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
    deleteInd: boolean;
    resourceVersion: string;

    /** Instance methods */
    delete(): void;
}

export const RAMSchema = (schema: Object) => {

    //noinspection ReservedWordAsName
    const result = new mongoose.Schema({
        deleteInd: {type: Boolean, default: false},
        resourceVersion: {type: String, default: '1'}
    }, {timestamps: true});

    result.add(schema);

    result.plugin(mongooseIdValidator);
    result.plugin(mongooseDeepPopulate);

    result.method('delete', () => {
        this.deleteInd = true;
        this.save();
    });

    return result;
};

export interface ICodeDecode extends mongoose.Document {
    shortDecodeText: string;
    longDecodeText: string;
    startDate: Date;
    endDate: Date;
    code: string;

    /** Instance methods below */

}

export interface ICodeDecodeContract {
    shortDecodeText: string;
    longDecodeText: string;
    startDate: Date;
    endDate: Date;
    code: string;
}

export class CodeDecodeContractImpl implements ICodeDecodeContract {
    constructor(public shortDecodeText: string,
                public longDecodeText: string,
                public startDate: Date,
                public endDate: Date,
                public code: string) {
    }
}

/* tslint:disable:max-func-body-length */
export const CodeDecodeSchema = (schema: Object) => {

    const result = new mongoose.Schema({
        shortDecodeText: {
            type: String,
            required: [true, 'Short description text is required'],
            trim: true
        },
        longDecodeText: {
            type: String,
            required: [true, 'Long description text is required'],
            trim: true
        },
        code: {
            type: String,
            required: [true, 'Code is required and must be string and unique'],
            trim: true,
            index: {unique: true}
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date
        }
    });

    result.add(schema);

    result.plugin(mongooseIdValidator);
    result.plugin(mongooseDeepPopulate);
    result.plugin(mongooseUniqueValidator);

    return result;
};

export const Model = (name: string, schema: mongoose.Schema, instanceContract: any, staticContract: any) => {

    Object.getOwnPropertyNames(instanceContract.prototype).forEach((key, index) => {
        let value = instanceContract.prototype[key];
        if (key !== 'constructor') {
            // console.log(key, value);
            schema.method(key, value);
        }
    });

    Object.getOwnPropertyNames(staticContract.prototype).forEach((key, index) => {
        let value = staticContract.prototype[key];
        if (key !== 'constructor') {
            // console.log(key, value);
            schema.static(key, value);
        }
    });

    return mongoose.model(name, schema);

};

export class Assert {

    public static assertNotNull(object: Object, failMessage: string, detail?: string) {
        if (!object) {
            if (detail) {
                logger.debug(`Assertion Failed: ${detail}`);
            }
            throw new Error(failMessage);
        }
    }

    public static assertTrue(condition: boolean, failMessage: string, detail?: string) {
        if (!condition) {
            if (detail) {
                logger.debug(`Assertion Failed: ${detail}`);
            }
            throw new Error(failMessage);
        }
    }

    public static assertEqual(value1: string, value2: string, failMessage: string) {
        const condition = value1 === value2;
        this.assertTrue(condition, failMessage, `${value1} != ${value2}`);
    }

    public static assertCaseInsensitiveEqual(value1: string, value2: string, failMessage: string, detail?: string) {
        const condition = _.trim(value1).toLowerCase() === _.trim(value2).toLowerCase();
        this.assertTrue(condition, failMessage, detail);
    }

}
