import {logger} from '../logger';
import {Request, Response, NextFunction} from 'express';
import {Headers} from '../controllers/headers';
import {Namespace} from 'continuation-local-storage';
import {IPrincipal} from '../models/principal.model';
import {IIdentity} from '../models/identity.model';
import {IAgencyUser} from '../models/agencyUser.model';
import {ErrorResponse} from '../../../commons/api';

import cls = require('continuation-local-storage');
import clsDomainsPromise = require('cls-domains-promise');

const DEFAULT_NAMESPACE_KEY = 'default';

class Context {

    public static init(): Namespace {
        let namespace = cls.createNamespace(DEFAULT_NAMESPACE_KEY);
        clsDomainsPromise(namespace, Promise.prototype);
        return namespace;
    };

    public static begin(req: Request, res: Response, next: NextFunction) {
        let namespace = Context.getNamespace();
        namespace.run(() => {
            Context.setup(req, res, next);
        });
    };

    public static setup(req: Request, res: Response, next: () => void) {
        // console.log('Setting up context ...');
        for (let key of Object.keys(res.locals)) {
            // keys should be lowercase, but let's make sure
            const keyLower = key.toLowerCase();
            // if it's an application key, copy it to the context
            if (keyLower.startsWith(Headers.Prefix)) {
                Context.set(keyLower, res.locals[key]);
            }
        }
        next();
    }

    public static get(key: string) {
        return Context.getNamespace().get(key);
    }

    public static set(key: string, value: any) {
        return Context.getNamespace().set(key, value);
    }

    public static getAuthenticatedIdentityIdValue(): string {
        return Context.get(Headers.IdentityIdValue);
    }

    public static getAuthenticatedIdentity(): IIdentity {
        return Context.get(Headers.Identity);
    }

    public static getAuthenticatedAgencyUserLoginId(): string {
        return Context.get(Headers.AgencyUserLoginId);
    }

    public static getAuthenticatedAgencyUser(): IAgencyUser {
        return Context.get(Headers.AgencyUser);
    }

    public static getAuthenticatedPrincipalIdValue(): string {
        return Context.get(Headers.PrincipalIdValue);
    }

    public static getAuthenticatedPrincipal(): IPrincipal {
        return Context.get(Headers.Principal);
    }

    public static getAuthenticatedABN(): string {
        return Context.get(Headers.ABN);
    }

    public static getAuthenticatedAUSkey(): string {
        return Context.get(Headers.AuthAUSkey);
    }

    public static getAuthenticatedClientAuth(): string {
        return Context.get(Headers.ClientAuth);
    }

    public static isAuthenticated(req: Request, res: Response, next: () => void) {
            const id = res.locals[Headers.PrincipalIdValue];
            if (id) {
                next();
            } else {
                logger.error('Unable to invoke route requiring authentication'.red);
                res.status(401);
                res.send(new ErrorResponse('Not authenticated.'));
            }
        }

    public static isAuthenticatedAsAgencyUser(req: Request, res: Response, next: () => void) {
        const principal = res.locals[Headers.Principal];
        if (principal && principal.agencyUserInd) {
            next();
        } else {
            logger.error('Unable to invoke route requiring agency user'.red);
            res.status(401);
            res.send(new ErrorResponse('Not authenticated as agency user.'));
        }
    }

    public static getNamespace() {
        return cls.getNamespace(DEFAULT_NAMESPACE_KEY);
    };

}

export const context = Context;