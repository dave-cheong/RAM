import {connectDisconnectMongo} from './helpers';
import {Seeder} from '../seeding/seed';
import {
    IRole,
    RoleModel,
    RoleStatus
} from '../models/role.model';
import {
    IRoleAttribute,
    RoleAttributeModel
} from '../models/roleAttribute.model';
import {IRoleType} from '../models/roleType.model';
import {IParty, PartyModel, PartyType} from '../models/party.model';
import {IName, NameModel} from '../models/name.model';
import {IProfile, ProfileModel, ProfileProvider} from '../models/profile.model';
import {IIdentity, IdentityModel, IdentityType, IdentityLinkIdScheme} from '../models/identity.model';

/* tslint:disable:max-func-body-length */
describe('RAM Role Attribute', () => {

    connectDisconnectMongo();

    let roleTypeCustom:IRoleType;

    let partyNickName1:IName;
    let partyProfile1:IProfile;
    let partyIdentity1:IIdentity;
    let party1:IParty;

    let role1:IRole;

    let roleAttribute1:IRoleAttribute;

    beforeEach((done) => {

        Seeder.verbose(false);

        Promise.resolve(null)
            .then()
            .then(Seeder.resetDataInMongo)
            .then(Seeder.loadReference)
            .then(async () => {

                try {

                    roleTypeCustom = Seeder.osp_roleType;

                    partyNickName1 = await NameModel.create({
                        givenName: 'Jane',
                        familyName: 'Subject 1'
                    });

                    partyProfile1 = await ProfileModel.create({
                        provider: ProfileProvider.MyGov.code,
                        name: partyNickName1
                    });

                    party1 = await PartyModel.create({
                        partyType: PartyType.Individual.code
                    });

                    partyIdentity1 = await IdentityModel.create({
                        rawIdValue: 'uuid_1',
                        identityType: IdentityType.LinkId.code,
                        defaultInd: true,
                        linkIdScheme: IdentityLinkIdScheme.MyGov.code,
                        profile: partyProfile1,
                        party: party1
                    });

                    roleAttribute1 = await RoleAttributeModel.create({
                        value: 'Preferred Name 1',
                        attributeName: Seeder.preferredName_roleAttributeName
                    });

                    role1 = await RoleModel.create({
                        roleType: roleTypeCustom,
                        party: party1,
                        startTimestamp: new Date(),
                        status: RoleStatus.Active.code,
                        attributes: [roleAttribute1]
                    });

                } catch (e) {
                    fail('Because ' + e);
                    done();
                }

            }).then(()=> {
                done();
            });
    });

    it('inserts with valid values', async (done) => {
        try {

            const value = 'true';
            const attributeName = Seeder.ssid_roleAttributeName;

            const instance = await RoleAttributeModel.create({
                value: [value],
                attributeName: attributeName
            } as IRoleAttribute);

            expect(instance).not.toBeNull();
            expect(instance.id).not.toBeNull();
            expect(instance.value[0]).toBe(value);
            expect(instance.attributeName.id).toBe(attributeName.id);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('fails insert with null attribute name', async (done) => {
        try {
            await RoleAttributeModel.create({
                value: ['true'],
                attributeName: null
            } as IRoleAttribute);
            fail('should not have inserted with null attribute name');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.errors.attributeName).not.toBeNull();
            done();
        }
    });

});