import {Builder} from './builder.dto';
import {ILink, IHasLinks} from './link.dto';
import {IProfile, Profile} from './profile.dto';
import {IHrefValue, HrefValue} from './hrefValue.dto';
import {IParty, Party} from './party.dto';

export interface IIdentity extends IHasLinks {
    idValue: string;
    rawIdValue: string;
    identityType: string;
    defaultInd: boolean;
    strength: number;
    agencyScheme: string;
    agencyToken: string;
    invitationCodeStatus: string;
    invitationCodeExpiryTimestamp: Date;
    invitationCodeClaimedTimestamp: Date;
    invitationCodeTemporaryEmailAddress: string;
    publicIdentifierScheme: string;
    linkIdScheme: string;
    linkIdConsumer: string;
    profile: IProfile;
    party: IHrefValue<IParty>;
}

export class Identity implements IIdentity {
    public static build(sourceObject: any): IIdentity {
        return new Builder<IIdentity>(sourceObject, this)
            .map('profile', Profile)
            .mapHref('party', Party)
            .build();
    }

    constructor(public _links: ILink[],
                public idValue: string,
                public rawIdValue: string,
                public identityType: string,
                public defaultInd: boolean,
                public strength: number,
                public agencyScheme: string,
                public agencyToken: string,
                public invitationCodeStatus: string,
                public invitationCodeExpiryTimestamp: Date,
                public invitationCodeClaimedTimestamp: Date,
                public invitationCodeTemporaryEmailAddress: string,
                public publicIdentifierScheme: string,
                public linkIdScheme: string,
                public linkIdConsumer: string,
                public profile: Profile,
                public party: HrefValue<Party>) {
    }
}