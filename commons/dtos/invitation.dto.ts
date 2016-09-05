// todo to be evaluated and removed if required

export class CreateIdentityDTO {
    constructor(public rawIdValue: string,
                public partyType: string,
                public givenName: string,
                public familyName: string,
                public unstructuredName: string,
                public sharedSecretTypeCode: string,
                public sharedSecretValue: string,
                public identityType: string,
                public strength: number,
                public agencyScheme: string,
                public agencyToken: string,
                public linkIdScheme: string,
                public linkIdConsumer: string,
                public publicIdentifierScheme: string,
                public profileProvider: string) {
    }
}

export interface ICreateInvitationCodeDTO {
    givenName?: string;
    familyName?: string;
    sharedSecretValue: string;
}

export interface IAttributeDTO {
    code: string;
    value: string;
}

export interface IInvitationCodeRelationshipAddDTO {
    relationshipType: string;
    subjectIdValue: string;
    delegate: ICreateInvitationCodeDTO;
    startTimestamp: Date;
    endTimestamp: Date;
    attributes: IAttributeDTO[];
}

export interface INotifyDelegateDTO {
    email: string;
}
