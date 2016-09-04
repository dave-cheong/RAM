import * as express from 'express';
import * as path from 'path';
import * as loggerMorgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as methodOverride from 'method-override';
import * as mongoose from 'mongoose';
import {conf} from './bootstrap';
import {logStream, logger} from './logger';
import {sendNotFoundError} from './controllers/helpers';
import {forgeRockSimulator} from './controllers/forgeRock.simulator.middleware';
import {security} from './controllers/security.middleware';

import expressValidator = require('express-validator');

// DEVELOPMENT CONTROLLERS
import {AuthenticatorSimulatorController} from './controllers/authenticator.simulator.controller';
import {AgencyUserController} from './controllers/agencyUser.controller';

// PRODUCTION CONTROLLERS
import {SystemController} from './controllers/system.controller';
import {PrincipalController} from './controllers/principal.controller';
import {PartyController} from './controllers/party.controller';
import {ProfileController} from './controllers/profile.controller';
import {IdentityController} from './controllers/identity.controller';
import {RelationshipController} from './controllers/relationship.controller';
import {RelationshipTypeController} from './controllers/relationshipType.controller';
import {RelationshipAttributeNameController} from './controllers/relationshipAttributeName.controller';
import {RoleController} from './controllers/role.controller';
import {RoleTypeController} from './controllers/roleType.controller';
import {BusinessController} from './controllers/business.controller';
import {AuskeyController} from './controllers/auskey.controller';
import {TransactController} from './controllers/transact.controller';

import {AUSkeyProvider} from './providers/auskey.provider';
import {context} from './providers/context.provider';

// connect to the database ............................................................................................

mongoose.Promise = Promise as any;

mongoose.connect(conf.mongoURL, {}, () => {
    logger.info(`Connected to db: ${conf.mongoURL}\n`);
});

// configure execution context ........................................................................................

context.init();

// configure express ..................................................................................................

const server = express();

switch (conf.devMode) {
    case false:
        // todo: Log to file: https://github.com/expressjs/morgan
        server.use(loggerMorgan('prod', { stream: logStream }));
        break;
    default:
        server.set('json spaces', 2);
        server.use(loggerMorgan('dev', { stream: logStream }));
        break;
}

server.use(cookieParser());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use(expressValidator());
server.use(methodOverride());
server.use(express.static(path.join(__dirname, conf.frontendDir)));
server.use(express.static('swagger'));

// setup security .....................................................................................................

if (conf.devMode) {
    server.use(forgeRockSimulator.prepareRequest());
}

server.use(security.prepareRequest());

if (conf.devMode) {
    server.use('/api/', new AuthenticatorSimulatorController().assignRoutes(express.Router()));
}

// setup route handlers (dev) .........................................................................................

server.use('/api/',
    new AgencyUserController()
        .assignRoutes(express.Router()));

// setup route handlers (production) ..................................................................................

server.use('/system',
    new SystemController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new PrincipalController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new RelationshipTypeController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new RelationshipAttributeNameController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new IdentityController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new PartyController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new ProfileController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new RelationshipController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new RoleController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new RoleTypeController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new BusinessController()
        .assignRoutes(express.Router()));

server.use('/api/',
    new AuskeyController(AUSkeyProvider)
        .assignRoutes(express.Router()));

server.use('/api/',
    new TransactController()
        .assignRoutes(express.Router()));

// setup error handlers ...............................................................................................

// catch 404 and forward to error handler
server.use((req: express.Request, res: express.Response) => {
    sendNotFoundError(res)(null);
});

// start server .......................................................................................................

server.listen(conf.httpPort);
logger.info(`RAM Server running in ${conf.devMode?'dev':'prod'} mode on port ${conf.httpPort}`);
