import {Builder} from './builder.dto';

export interface IAgencyUser {
    id: string;
    givenName: string;
    familyName: string;
    displayName: string;
    programRoles: IAgencyUserProgramRole[]
}

export class AgencyUser implements IAgencyUser {
    public static build(sourceObject: any): IAgencyUser {
        return new Builder<IAgencyUser>(sourceObject, this)
            .mapArray('programRoles', AgencyUserProgramRole)
            .build();
    }

    constructor(public id: string,
                public givenName: string,
                public familyName: string,
                public displayName: string,
                public agency: string,
                public programRoles: AgencyUserProgramRole[]) {
    }
}

export interface IAgencyUserProgramRole {
    program: string;
    role: string;
}

export class AgencyUserProgramRole implements IAgencyUserProgramRole {
    public static build(sourceObject: any): IAgencyUserProgramRole {
        return new Builder<IAgencyUserProgramRole>(sourceObject, this)
            .build();
    }

    constructor(public program: string,
                public role: string) {
    }
}
