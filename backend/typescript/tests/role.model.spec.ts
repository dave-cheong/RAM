import {connectDisconnectMongo} from './helpers';
import {Seeder} from '../seeding/seed';
import {
    IRole,
    RoleModel,
    RoleStatus
} from '../models/role.model';
import {IRoleType} from '../models/roleType.model';
import {IRoleAttribute, RoleAttributeModel} from '../models/roleAttribute.model';
import {IParty, PartyModel, PartyType} from '../models/party.model';
import {IIdentity, IdentityModel, IdentityType, IdentityLinkIdScheme} from '../models/identity.model';
import {IProfile, ProfileModel, ProfileProvider} from '../models/profile.model';
import {IName, NameModel} from '../models/name.model';

/* tslint:disable:max-func-body-length */
describe('RAM Role', () => {

    connectDisconnectMongo();

    let roleTypeOsp:IRoleType;

    let partyNickName1:IName;
    let partyProfile1:IProfile;
    let party1:IParty;
    let partyIdentity1:IIdentity;

    let roleAttribute1:IRoleAttribute;
    let role1:IRole;

    beforeEach((done) => {

        Seeder.verbose(false);

        Promise.resolve(null)
            .then()
            .then(Seeder.resetDataInMongo)
            .then(Seeder.loadReference)
            .then(async () => {

                try {

                    roleTypeOsp = Seeder.osp_roleType;

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
                        value: ['true'],
                        attributeName: Seeder.usi_roleAttributeName
                    } as IRoleAttribute);

                    role1 = await RoleModel.add(
                        roleTypeOsp,
                        party1,
                        new Date(2000, 1, 1),
                        null,
                        RoleStatus.Active,
                        [roleAttribute1]
                    );

                } catch (e) {
                    fail(e);
                    done();
                }

            }).then(()=> {
                done();
            });
    });

    it('inserts with no end timestamp', async (done) => {
        try {

            const instance = await RoleModel.create({
                roleType: roleTypeOsp,
                party: party1,
                startTimestamp: new Date(),
                status: RoleStatus.Active.code,
                attributes: []
            });

            expect(instance).not.toBeNull();
            expect(instance._id).not.toBeNull();
            expect(instance.endEventTimestamp).toBeFalsy();

            done();

        } catch (e) {
            fail(e);
            done();
        }
    });

    it('inserts with end timestamp', async (done) => {
        try {

            const instance = await RoleModel.create({
                roleType: roleTypeOsp,
                party: party1,
                startTimestamp: new Date(),
                endTimestamp: new Date(),
                status: RoleStatus.Active.code
            });

            expect(instance).not.toBeNull();
            expect(instance._id).not.toBeNull();
            expect(instance.endEventTimestamp).not.toBeFalsy();

            done();

        } catch (e) {
            fail(e);
            done();
        }
    });

    it('searches successfully', async (done) => {
        try {

            const roles = await RoleModel.searchByIdentity(partyIdentity1.idValue, roleTypeOsp.code, RoleStatus.Active.code, false, 1, 10);
            expect(roles.totalCount).toBeGreaterThan(0);
            expect(roles.list.length).toBeGreaterThan(0);

            done();

        } catch (e) {
            fail(e);
            done();
        }
    });

    it('find active by identity in date range successfully', async (done) => {
        try {

            const role = await RoleModel.findActiveByIdentityInDateRange(partyIdentity1.idValue, roleTypeOsp.code, new Date());
            expect(role).not.toBeNull();

            done();

        } catch (e) {
            fail(e);
            done();
        }
    });

    it('attribute should be deleted', async (done) => {
        try {

            // setup
            const roleAttribute = await RoleAttributeModel.create({
                value: ['true'],
                attributeName: Seeder.usi_roleAttributeName
            } as IRoleAttribute);

            const role = await RoleModel.add(
                roleTypeOsp,
                party1,
                new Date(2000, 1, 1),
                null,
                RoleStatus.Active,
                [roleAttribute]
            );

            // perform
            await role.deleteAttribute(roleAttribute.attributeName.code, roleAttribute.attributeName.classifier);

            // verify
            const actualRole = await RoleModel.findByIdentifier(role._id);
            expect(actualRole.attributes.length).toBe(0);

            // attribute should no longer exist
            const actualRoleAttribute = await RoleAttributeModel.findById(roleAttribute.id);
            expect(actualRoleAttribute).toBe(null);

            done();

        } catch (e) {
            fail(e);
            done();
        }
    });
});