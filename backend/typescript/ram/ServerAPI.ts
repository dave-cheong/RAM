/// <reference path="../_BackendTypes.ts" />

/*
* IRamConf is used for providing type safety over configuration
* file provided through environment variable
*/

export interface IRamConf {
    frontendDir: string;
    logDir: string;
    httpPort: number;
    mongoURL: string;
    devMode: boolean;
    hashIdsSalt: string;
    exportLDIFFileName: string;
    abrAuthenticationGuid: string;
    auskeyProviderMock: boolean;
}

export interface SecurityToken {
    partyId: string;
    navPathIds: string[];
}
