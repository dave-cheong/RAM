import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {ProfileProvider} from '../models/profile.model';
import {PartyType} from '../models/party.model';
import {IdentityType, IdentityLinkIdScheme} from '../models/identity.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class EdOanerIdentitySeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Sample Identity - Ed Oaner:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.edoaner_name = await Seeder.createNameModel({
                    givenName: 'Ed',
                    familyName: 'Oaner'
                } as any);

                Seeder.edoaner_dob = await Seeder.createSharedSecretModel({
                    value: '01/01/2000',
                    sharedSecretType: Seeder.dob_sharedSecretType
                } as any);

                Seeder.edoaner_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.MyGov.code,
                    name: Seeder.edoaner_name,
                    sharedSecrets: [Seeder.edoaner_dob]
                } as any);

                Seeder.edoaner_party = await Seeder.createPartyModel({
                    partyType: PartyType.Individual.code
                } as any);

                Seeder.log('');

                Seeder.edoaner_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: 'edoaner_identity_1',
                    identityType: IdentityType.LinkId.code,
                    defaultInd: true,
                    strength: 1,
                    linkIdScheme: IdentityLinkIdScheme.MyGov.code,
                    profile: Seeder.edoaner_profile,
                    party: Seeder.edoaner_party
                } as any);

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
