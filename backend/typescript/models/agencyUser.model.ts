import {
    HrefValue,
    AgencyUser as AgencyUserDTO,
    AgencyUserProgramRole as AgencyUserProgramRoleDTO
} from '../../../commons/RamAPI';

export interface IAgencyUser {
    id: string;
    givenName: string;
    familyName: string;
    displayName: string;
    programRoles: IAgencyUserProgramRole[];
    toHrefValue(includeValue: boolean): Promise<HrefValue<AgencyUserDTO>>;
    toDTO(): Promise<AgencyUserDTO>;
}

export interface IAgencyUserProgramRole {
    program: string;
    role: string;
    toDTO(): Promise<AgencyUserProgramRoleDTO>;
}

export class AgencyUser implements IAgencyUser {

    constructor(public id: string,
                public givenName: string,
                public familyName: string,
                public displayName: string,
                public programRoles: IAgencyUserProgramRole[]) {
    }

    public async toHrefValue(includeValue: boolean): Promise<HrefValue<AgencyUserDTO>> {
        return new HrefValue(
            '/api/v1/agencyUser/' + encodeURIComponent(this.id),
            includeValue ? await this.toDTO() : undefined
        );
    }

    public async toDTO(): Promise<AgencyUserDTO> {
        return Promise.resolve(new AgencyUserDTO(
            this.id,
            this.givenName,
            this.familyName,
            this.displayName,
            await Promise.all<AgencyUserProgramRoleDTO>(this.programRoles.map(
                async (programRole:IAgencyUserProgramRole) => {
                    return programRole.toDTO();
                }))
        ));
    }

}

export class AgencyUserProgramRole implements IAgencyUserProgramRole {

    constructor(public program: string,
                public role: string) {
    }

    public toDTO(): Promise<AgencyUserProgramRoleDTO> {
        return Promise.resolve(new AgencyUserProgramRoleDTO(
            this.program,
            this.role
        ));
    }

}
