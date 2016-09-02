import {connectDisconnectMongo, resetDataInMongo} from './helpers';
import {
    ISharedSecret,
    SharedSecretModel} from '../models/sharedSecret.model';
import {
    ISharedSecretType,
    SharedSecretTypeModel} from '../models/sharedSecretType.model';
import {
    IName,
    NameModel} from '../models/name.model';
import {
    IProfile,
    ProfileModel,
    ProfileProvider} from '../models/profile.model';
import {
    IParty,
    PartyModel,
    PartyType} from '../models/party.model';
import {
    IIdentity,
    IdentityModel,
    IdentityType,
    IdentityLinkIdScheme} from '../models/identity.model';

/* tslint:disable:max-func-body-length */
describe('RAM Shared Secret', () => {

    connectDisconnectMongo();
    resetDataInMongo();

    let sharedSecretTypeNoEndDate: ISharedSecretType;
    let sharedSecretTypeFutureEndDate: ISharedSecretType;
    let sharedSecretTypeExpiredEndDate: ISharedSecretType;

    let sharedSecretNoEndDate: ISharedSecret;
    let sharedSecretValue1 = 'secret_value_1';
    let name1: IName;
    let profile1: IProfile;
    let party1: IParty;
    let identity1: IIdentity;

    beforeEach(async (done) => {

        try {

            sharedSecretTypeNoEndDate = await SharedSecretTypeModel.create({
                code: 'SHARED_SECRET_TYPE_1',
                shortDecodeText: 'Shared Secret',
                longDecodeText: 'Shared Secret',
                startDate: new Date(),
                domain: 'domain'
            });

            sharedSecretTypeFutureEndDate = await SharedSecretTypeModel.create({
                code: 'SHARED_SECRET_TYPE_2',
                shortDecodeText: 'Shared Secret',
                longDecodeText: 'Shared Secret',
                startDate: new Date(),
                endDate: new Date(2099, 1, 1),
                domain: 'domain'
            });

            sharedSecretTypeExpiredEndDate = await SharedSecretTypeModel.create({
                code: 'SHARED_SECRET_TYPE_3',
                shortDecodeText: 'Shared Secret',
                longDecodeText: 'Shared Secret',
                startDate: new Date(2016, 1, 1),
                endDate: new Date(2016, 1, 2),
                domain: 'domain'
            });

            sharedSecretNoEndDate = await SharedSecretModel.create({
                value: sharedSecretValue1,
                sharedSecretType: sharedSecretTypeNoEndDate
            });

            name1 = await NameModel.create({
                givenName: 'John',
                familyName: 'Smith'
            });

            profile1 = await ProfileModel.create({
                provider: ProfileProvider.MyGov.code,
                name: name1,
                sharedSecrets: [sharedSecretNoEndDate]
            });

            party1 = await PartyModel.create({
                partyType: PartyType.Individual.code,
                name: name1
            });

            identity1 = await IdentityModel.create({
                rawIdValue: 'uuid_1',
                identityType: IdentityType.LinkId.code,
                defaultInd: false,
                linkIdScheme: IdentityLinkIdScheme.MyGov.code,
                profile: profile1,
                party: party1
            });

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }

    });

    it('finds identity includes profile and shared secrets', async (done) => {
        try {
            const instance = await IdentityModel.findByIdValue(identity1.idValue);
            expect(instance).not.toBeNull();
            expect(instance.id).toBe(identity1.id);
            expect(instance.profile.id).toBe(profile1.id);
            expect(instance.profile.sharedSecrets.length).toBe(1);
            expect(instance.profile.sharedSecrets[0].sharedSecretType.code).toBe(sharedSecretNoEndDate.sharedSecretType.code);
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('hashes value upon insert', async (done) => {
        try {
            const instance = await IdentityModel.findByIdValue(identity1.idValue);
            expect(instance).not.toBeNull();
            expect(instance.profile.sharedSecrets[0].value).not.toBeNull();
            expect(instance.profile.sharedSecrets[0].value).toBe(sharedSecretNoEndDate.value);
            expect(instance.profile.sharedSecrets[0].value).not.toBe(sharedSecretValue1);
            expect(instance.profile.sharedSecrets[0].matchesValue(sharedSecretValue1)).toBe(true);
            expect(instance.profile.sharedSecrets[0].matchesValue('__BOGUS__')).toBe(false);
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('hashes value upon update', async (done) => {
        try {
            let sharedSecretValue2 = 'secret_value_2';
            let instance = await IdentityModel.findByIdValue(identity1.idValue);
            sharedSecretNoEndDate.value = sharedSecretValue2;
            await sharedSecretNoEndDate.save();
            instance = await IdentityModel.findByIdValue(identity1.idValue);
            expect(instance).not.toBeNull();
            expect(instance.profile.sharedSecrets[0].value).not.toBeNull();
            expect(instance.profile.sharedSecrets[0].value).toBe(sharedSecretNoEndDate.value);
            expect(instance.profile.sharedSecrets[0].value).not.toBe(sharedSecretValue2);
            expect(instance.profile.sharedSecrets[0].matchesValue(sharedSecretValue1)).toBe(false);
            expect(instance.profile.sharedSecrets[0].matchesValue(sharedSecretValue2)).toBe(true);
            expect(instance.profile.sharedSecrets[0].matchesValue('__BOGUS__')).toBe(false);
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('matches value', async (done) => {
        try {
            expect(sharedSecretNoEndDate.matchesValue(sharedSecretValue1)).toBe(true);
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('does not match null value', async (done) => {
        try {
            expect(sharedSecretNoEndDate.matchesValue(null)).toBe(false);
            done();
        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

});