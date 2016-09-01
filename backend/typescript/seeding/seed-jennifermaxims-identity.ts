import {conf} from '../bootstrap';
import {Seeder} from './seed';
import {ProfileProvider} from '../models/profile.model';
import {PartyType} from '../models/party.model';
import {IdentityType, IdentityLinkIdScheme} from '../models/identity.model';

// seeder .............................................................................................................

/* tslint:disable:no-any */
/* tslint:disable:max-func-body-length */
export class JenniferMaximsIdentitySeeder {

    public static async load() {
        try {

            Seeder.log('\nInserting Sample Identity - Jennifer Maxim:\n'.underline);

            if (!conf.devMode) {

                Seeder.log('Skipped in prod mode'.gray);

            } else {

                Seeder.jennifermaxims_name = await Seeder.createNameModel({
                    givenName: 'Jennifer',
                    familyName: 'Maxims'
                } as any);

                Seeder.jennifermaxims_dob = await Seeder.createSharedSecretModel({
                    value: '31/01/1990',
                    sharedSecretType: Seeder.dob_sharedSecretType
                } as any);

                Seeder.jennifermaxims_profile = await Seeder.createProfileModel({
                    provider: ProfileProvider.MyGov.code,
                    name: Seeder.jennifermaxims_name,
                    sharedSecrets: [Seeder.jennifermaxims_dob]
                } as any);

                Seeder.jennifermaxims_party = await Seeder.createPartyModel({
                    partyType: PartyType.Individual.code
                } as any);

                Seeder.log('');

                Seeder.jennifermaxims_identity_1 = await Seeder.createIdentityModel({
                    rawIdValue: 'jennifermaxims_identity_1',
                    identityType: IdentityType.LinkId.code,
                    defaultInd: true,
                    strength: 1,
                    linkIdScheme: IdentityLinkIdScheme.MyGov.code,
                    profile: Seeder.jennifermaxims_profile,
                    party: Seeder.jennifermaxims_party
                } as any);

            }

        } catch (e) {
            Seeder.log('Seeding failed!');
            Seeder.log(e);
        }
    }

}
