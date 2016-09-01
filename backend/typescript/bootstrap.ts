import * as api from './ram/ServerAPI';
import {Translator} from './ram/translator';

// load environmental config ..........................................................................................

// ensure RAM_CONF is specified
if (process.env.RAM_CONF === void 0 ||
    process.env.RAM_CONF.trim().length === 0) {
    console.log('Missing RAM_CONF environment variable');
    process.exit(1);
}

/* tslint:disable:no-var-requires */
export const conf: api.IRamConf = require(`${process.env.RAM_CONF}`);

// initialise the translation/localisation service
Translator.initialise();
