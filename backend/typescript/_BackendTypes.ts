/// <reference path="../typings/index.d.ts" />
/// <reference path="mongoose-patch.d.ts" />
/// <reference path="server.ts" />
/// <reference path="logger.ts" />

/* tslint:disable:no-unused-variable */
declare module 'continuation-local-storage' {

    namespace e {

        interface Namespace {
            name: string;
            active: {[key: string]: any};
            get(key: string): any;
            set(key: string, value: any): void;
            run(fn: Function): void;
            bind(fn: Function): void;
        }

        function getNamespace(name: string): Namespace;

        function createNamespace(name: string): Namespace;

    }

    export = e;

}

/* tslint:disable:no-unused-variable */
declare module 'cls-domains-promise' {

    import {Namespace as CLSNamespace} from 'continuation-local-storage';

    function patchIt(namespace: CLSNamespace, proto: Promise<Object>): void;

    export = patchIt;

}
