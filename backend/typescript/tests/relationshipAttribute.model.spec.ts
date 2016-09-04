import {connectDisconnectMongo} from './helpers';
import {Seeder} from '../seeding/seed';
import {
    IIdentity,
    IdentityModel,
    IdentityType,
    IdentityInvitationCodeStatus} from '../models/identity.model';
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
    IRelationship,
    RelationshipModel,
    RelationshipStatus,
    RelationshipInitiatedBy
} from '../models/relationship.model';
import {
    IRelationshipAttribute,
    RelationshipAttributeModel
} from '../models/relationshipAttribute.model';
import {IRelationshipType} from '../models/relationshipType.model';

/* tslint:disable:max-func-body-length */
describe('RAM Relationship Attribute', () => {

    connectDisconnectMongo();

    let relationshipTypeCustom:IRelationshipType;

    let subjectNickName1:IName;
    let subjectParty1:IParty;

    let delegateNickName1:IName;
    let delegateProfile1:IProfile;
    let delegateParty1:IParty;

    let delegateIdentity1:IIdentity;
    let relationship1:IRelationship;

    let relationshipAttribute1:IRelationshipAttribute;

    beforeEach((done) => {

        Seeder.verbose(false);

        Promise.resolve(null)
            .then()
            .then(Seeder.resetDataInMongo)
            .then(Seeder.loadReference)
            .then(async () => {

                try {

                    relationshipTypeCustom = Seeder.custom_delegate_relationshipType;

                    subjectNickName1 = await NameModel.create({
                        givenName: 'Jane',
                        familyName: 'Subject 1'
                    });

                    subjectParty1 = await PartyModel.create({
                        partyType: PartyType.Individual.code
                    });

                    delegateNickName1 = await NameModel.create({
                        givenName: 'John',
                        familyName: 'Delegate 1'
                    });

                    delegateProfile1 = await ProfileModel.create({
                        provider: ProfileProvider.MyGov.code,
                        name: delegateNickName1
                    });

                    delegateParty1 = await PartyModel.create({
                        partyType: PartyType.Individual.code
                    });

                    delegateIdentity1 = await IdentityModel.create({
                        identityType: IdentityType.InvitationCode.code,
                        defaultInd: true,
                        invitationCodeStatus: IdentityInvitationCodeStatus.Pending.code,
                        invitationCodeExpiryTimestamp: new Date(2055, 1, 1),
                        profile: delegateProfile1,
                        party: delegateParty1
                    });

                    relationshipAttribute1 = await RelationshipAttributeModel.create({
                        value: 'true',
                        attributeName: Seeder.delegateManageAuthorisationAllowedInd_relAttributeName
                    });

                    relationship1 = await RelationshipModel.create({
                        relationshipType: relationshipTypeCustom,
                        subject: subjectParty1,
                        subjectNickName: subjectNickName1,
                        delegate: delegateParty1,
                        delegateNickName: delegateNickName1,
                        startTimestamp: new Date(),
                        status: RelationshipStatus.Pending.code,
                        initiatedBy: RelationshipInitiatedBy.Subject.code,
                        attributes: [relationshipAttribute1]
                    } as any);

                } catch (e) {
                    fail('Because ' + e);
                    done();
                }

            }).then(()=> {
                done();
            });
    });

    it('finds relationship by identifier includes attributes', async (done) => {
        try {

            const retrievedInstance = await RelationshipModel.findByIdentifier(relationship1.id);

            expect(retrievedInstance).not.toBeNull();
            expect(retrievedInstance.id).not.toBeNull();
            expect(retrievedInstance.id).toBe(relationship1.id);
            expect(retrievedInstance.attributes).not.toBeNull();
            expect(retrievedInstance.attributes.length).toBe(1);
            expect(retrievedInstance.attributes[0].id).toBe(relationshipAttribute1.id);
            expect(retrievedInstance.attributes[0].value[0]).toBe(relationshipAttribute1.value[0]);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('inserts with valid values', async (done) => {
        try {

            const value = 'true';
            const attributeName = Seeder.delegateManageAuthorisationAllowedInd_relAttributeName;

            const instance = await RelationshipAttributeModel.create({
                value: value,
                attributeName: attributeName
            });

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
            await RelationshipAttributeModel.create({
                value: 'true',
                attributeName: null
            });
            fail('should not have inserted with null attribute name');
            done();
        } catch (e) {
            expect(e.name).toBe('ValidationError');
            expect(e.errors.attributeName).not.toBeNull();
            done();
        }
    });

});