import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {ProfileProvider} from '../models/profile.model';
import {PartyType} from '../models/party.model';
import {IdentityType, IdentityLinkIdScheme} from '../models/identity.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class PattyPeacefulIdentitySeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Sample Identity - Patty Peaceful:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.pattypeaceful_name = await Seeder.createNameModel({
                    givenName: 'Patty',
                    familyName: 'Peaceful'
                } as any);

                Seeder.pattypeaceful_dob = await Seeder.createSharedSecretModel({
                    value: '31/01/1990',
                    sharedSecretType: Seeder.dob_sharedSecretType
                } as any);

                Seeder.pattypeaceful_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.MyGov.code,
                    name: Seeder.pattypeaceful_name,
                    sharedSecrets: [Seeder.pattypeaceful_dob]
                } as any);

                Seeder.pattypeaceful_party = await Seeder.createPartyModel({
                    partyType: PartyType.Individual.code
                } as any);

                Seeder.log('');

                Seeder.pattypeaceful_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: 'pattypeaceful_identity_1',
                    identityType: IdentityType.LinkId.code,
                    defaultInd: true,
                    strength: 1,
                    linkIdScheme: IdentityLinkIdScheme.MyGov.code,
                    profile: Seeder.pattypeaceful_profile,
                    party: Seeder.pattypeaceful_party
                } as any);

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
