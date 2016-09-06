import {logger} from '../logger';
import * as mongoose from 'mongoose';
import {Model, RAMEnum, RAMSchema, IRAMObject, RAMObject, Query, Assert} from './base';
import {Url} from './url';
import {SharedSecretModel, ISharedSecret} from './sharedSecret.model';
import {DOB_SHARED_SECRET_TYPE_CODE, SharedSecretTypeModel} from './sharedSecretType.model';
import {IParty, PartyModel, PartyType} from './party.model';
import {IName, NameModel} from './name.model';
import {IRelationshipType, RelationshipTypeModel} from './relationshipType.model';
import {IRelationshipAttribute, RelationshipAttributeModel} from './relationshipAttribute.model';
import {RelationshipAttributeNameModel, RelationshipAttributeNameClassifier} from './relationshipAttributeName.model';
import {ProfileProvider} from './profile.model';
import {
    IdentityModel,
    IIdentity,
    IdentityType,
    IdentityInvitationCodeStatus,
    IdentityPublicIdentifierScheme
} from './identity.model';
import {context} from '../providers/context.provider';
import {
    HrefValue,
    Relationship as DTO,
    RelationshipStatus as RelationshipStatusDTO,
    RelationshipAttribute as RelationshipAttributeDTO,
    SearchResult
} from '../../../commons/api';
import {Translator} from '../ram/translator';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _PartyModel = PartyModel;

/* tslint:disable:no-unused-variable */
const _NameModel = NameModel;

/* tslint:disable:no-unused-variable */
const _RelationshipAttributeModel = RelationshipAttributeModel;

/* tslint:disable:no-unused-variable */
const _RelationshipAttributeNameModel = RelationshipAttributeNameModel;

/* tslint:disable:no-unused-variable */
const _RelationshipTypeModel = RelationshipTypeModel;

const MAX_PAGE_SIZE = 10;

// mongoose ...........................................................................................................

let RelationshipMongooseModel: mongoose.Model<IRelationshipDocument>;

// enums, utilities, helpers ..........................................................................................

export class RelationshipStatus extends RAMEnum {

    public static Accepted = new RelationshipStatus('ACCEPTED', 'Accepted');
    public static Cancelled = new RelationshipStatus('CANCELLED', 'Cancelled');
    public static Declined = new RelationshipStatus('DECLINED', 'Declined');
    public static Deleted = new RelationshipStatus('DELETED', 'Deleted');
    public static Pending = new RelationshipStatus('PENDING', 'Pending');
    public static Revoked = new RelationshipStatus('REVOKED', 'Revoked');
    public static Suspended = new RelationshipStatus('SUSPENDED', 'Suspended');

    protected static AllValues = [
        RelationshipStatus.Accepted,
        RelationshipStatus.Cancelled,
        RelationshipStatus.Declined,
        RelationshipStatus.Deleted,
        RelationshipStatus.Pending,
        RelationshipStatus.Revoked,
        RelationshipStatus.Suspended
    ];

    constructor(code: string, shortDecodeText: string) {
        super(code, shortDecodeText);
    }

    public async toHrefValue(includeValue: boolean): Promise<HrefValue<RelationshipStatusDTO>> {
        return Promise.resolve(new HrefValue(
            await Url.forRelationshipStatus(this),
            includeValue ? this.toDTO() : undefined
        ));
    }

    public toDTO(): RelationshipStatusDTO {
        return new RelationshipStatusDTO(this.code, this.shortDecodeText);
    }
}

export class RelationshipInitiatedBy extends RAMEnum {

    public static Subject = new RelationshipInitiatedBy('SUBJECT', 'Subject');
    public static Delegate = new RelationshipInitiatedBy('DELEGATE', 'Delegate');

    protected static AllValues = [
        RelationshipInitiatedBy.Subject,
        RelationshipInitiatedBy.Delegate
    ];

    constructor(code: string, shortDecodeText: string) {
        super(code, shortDecodeText);
    }
}

// schema .............................................................................................................

const RelationshipSchema = RAMSchema({
    relationshipType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RelationshipType',
        required: [true, 'Relationship Type is required']
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        required: [true, 'Subject is required']
    },
    subjectNickName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Name',
        required: [true, 'Subject Nick Name is required']
    },
    delegate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        required: [true, 'Delegate is required']
    },
    delegateNickName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Name',
        required: [true, 'Delegate Nick Name is required']
    },
    invitationIdentity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Identity'
    },
    startTimestamp: {
        type: Date,
        required: [true, 'Start Timestamp is required']
    },
    endTimestamp: {
        type: Date,
        set: function (value: String) {
            if (value) {
                this.endEventTimestamp = new Date();
            }
            return value;
        }
    },
    endEventTimestamp: {
        type: Date,
        required: [function () {
            return this.endTimestamp;
        }, 'End Event Timestamp is required']
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        trim: true,
        enum: RelationshipStatus.valueStrings()
    },
    initiatedBy: {
        type: String,
        required: [true, 'Initiated by is required'],
        trim: true,
        enum: RelationshipInitiatedBy.valueStrings()
    },
    supersededBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Relationship'
    },
    attributes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RelationshipAttribute'
    }],
    _relationshipTypeCode: {
        type: String,
        required: [true, 'Relationship Type Code is required'],
        trim: true
    },
    _relationshipTypeCategory: {
        type: String,
        required: [true, 'Relationship Type Category is required'],
        trim: true
    },
    _subjectNickNameString: {
        type: String,
        required: [true, 'Subject Nick Name String is required'],
        trim: true
    },
    _delegateNickNameString: {
        type: String,
        required: [true, 'Delegate NickName String is required'],
        trim: true
    },
    _subjectABNString: {
        type: String,
        trim: true
    },
    _delegateABNString: {
        type: String,
        trim: true
    },
    _subjectPartyTypeCode: {
        type: String,
        required: [true, 'Subject Party Type Code is required'],
        trim: true
    },
    _delegatePartyTypeCode: {
        type: String,
        required: [true, 'Delegate Party Type Code is required'],
        trim: true
    },
    _subjectProfileProviderCodes: [{
        type: String
    }],
    _delegateProfileProviderCodes: [{
        type: String
    }]
});

RelationshipSchema.pre('validate', function (next: () => void) {
    if (this.relationshipType) {
        this._relationshipTypeCode = this.relationshipType.code;
    }
    if (this.relationshipType) {
        this._relationshipTypeCategory = this.relationshipType.category;
    }
    if (this.subjectNickName) {
        this._subjectNickNameString = this.subjectNickName._displayName;
    }
    if (this.delegateNickName) {
        this._delegateNickNameString = this.delegateNickName._displayName;
    }
    this._subjectPartyTypeCode = this.subject.partyType;
    this._delegatePartyTypeCode = this.delegate.partyType;
    const subjectPromise = IdentityModel.listByPartyId(this.subject.id)
        .then((identities: IIdentity[]) => {
            this._subjectProfileProviderCodes = [];
            for (let identity of identities) {
                this._subjectProfileProviderCodes.push(identity.profile.provider);
                if (identity.publicIdentifierScheme === IdentityPublicIdentifierScheme.ABN.code) {
                    this._subjectABNString = identity.rawIdValue;
                }
            }
        });
    const delegatePromise = IdentityModel.listByPartyId(this.delegate.id)
        .then((identities: IIdentity[]) => {
            this._delegateProfileProviderCodes = [];
            for (let identity of identities) {
                this._delegateProfileProviderCodes.push(identity.profile.provider);
                if (identity.publicIdentifierScheme === IdentityPublicIdentifierScheme.ABN.code) {
                    this._delegateABNString = identity.rawIdValue;
                }
            }
        });
    Promise.all([subjectPromise, delegatePromise])
        .then(() => {
            next();
        })
        .catch((err: Error) => {
            next();
        });
});

// instance ............................................................................................................

export interface IRelationship extends IRAMObject {
    id: string;
    relationshipType: IRelationshipType;
    subject: IParty;
    subjectNickName: IName;
    delegate: IParty;
    delegateNickName: IName;
    invitationIdentity: IIdentity;
    startTimestamp: Date;
    endTimestamp?: Date;
    endEventTimestamp?: Date;
    status: string;
    initiatedBy: string;
    supersededBy: IRelationship;
    attributes: IRelationshipAttribute[];
    _subjectNickNameString: string;
    _delegateNickNameString: string;
    _subjectABNString: string;
    _delegateABNString: string;
    _subjectPartyTypeCode: string;
    _delegatePartyTypeCode: string;
    _relationshipTypeCode: string;
    _subjectProfileProviderCodes: string[];
    _delegateProfileProviderCodes: string[];
    statusEnum(): RelationshipStatus;
    toHrefValue(includeValue: boolean): Promise<HrefValue<DTO>>;
    toDTO(invitationCode?: string): Promise<DTO>;
    claimPendingInvitation(claimingDelegateIdentity: IIdentity, invitationCode: string): Promise<IRelationship>;
    acceptPendingInvitation(acceptingDelegateIdentity: IIdentity): Promise<IRelationship>;
    rejectPendingInvitation(rejectingDelegateIdentity: IIdentity): Promise<IRelationship>;
    notifyDelegate(email: string, notifyingIdentity: IIdentity): Promise<IRelationship>;

}

class Relationship extends RAMObject implements IRelationship {

    public id: string;
    public relationshipType: IRelationshipType;
    public subject: IParty;
    public subjectNickName: IName;
    public delegate: IParty;
    public delegateNickName: IName;
    public invitationIdentity: IIdentity;
    public startTimestamp: Date;
    public endTimestamp: Date;
    public endEventTimestamp: Date;
    public status: string;
    public initiatedBy: string;
    public supersededBy: IRelationship;
    public attributes: IRelationshipAttribute[];
    public _subjectNickNameString: string;
    public _delegateNickNameString: string;
    public _subjectABNString: string;
    public _delegateABNString: string;
    public _subjectPartyTypeCode: string;
    public _delegatePartyTypeCode: string;
    public _relationshipTypeCode: string;
    public _subjectProfileProviderCodes: string[];
    public _delegateProfileProviderCodes: string[];

    public statusEnum(): RelationshipStatus {
        return RelationshipStatus.valueOf(this.status) as RelationshipStatus;
    }

    public async toHrefValue(includeValue: boolean): Promise<HrefValue<DTO>> {
        return new HrefValue(
            await Url.forRelationship(this),
            includeValue ? await this.toDTO(null) : undefined
        );
    }

    public async toDTO(invitationCode?: string): Promise<DTO> {
        const pendingWithInvitationCode = invitationCode && this.statusEnum() === RelationshipStatus.Pending;

        // todo need to use security context to drive the links
        return new DTO(
            Url.links()
                .push('self', Url.GET, await Url.forRelationship(this))
                .push('claim', Url.POST, await Url.forRelationshipClaim(invitationCode), pendingWithInvitationCode)
                .push('accept', Url.POST, await Url.forRelationshipAccept(invitationCode), pendingWithInvitationCode && this.canAccept())
                .push('reject', Url.POST, await Url.forRelationshipReject(invitationCode), pendingWithInvitationCode)
                .push('notifyDelegate', Url.POST, await Url.forRelationshipNotifyDelegate(invitationCode), pendingWithInvitationCode)
                .push('modify', Url.PUT, await Url.forRelationship(this))
                .toArray(),
            await this.relationshipType.toHrefValue(false),
            await this.subject.toHrefValue(true),
            await this.subjectNickName.toDTO(),
            await this.delegate.toHrefValue(true),
            await this.delegateNickName.toDTO(),
            this.startTimestamp,
            this.endTimestamp,
            this.endEventTimestamp,
            this.status,
            this.initiatedBy,
            this.supersededBy ? await this.supersededBy.toHrefValue(false) : null,
            await Promise.all<RelationshipAttributeDTO>(this.attributes.map(
                async(attribute: IRelationshipAttribute) => {
                    return await attribute.toDTO();
                }))
        );
    }

    public async claimPendingInvitation(claimingDelegateIdentity: IIdentity, invitationCode: string): Promise<IRelationship> {
            /* validate */

            // validate current status
            Assert.assertTrue(this.statusEnum() === RelationshipStatus.Pending, 'Unable to accept a non-pending relationship');

            // if the user is already the delegate then there is nothing to do
            if (this.delegate.id === claimingDelegateIdentity.party.id) {
                return this as IRelationship;
            }

            // find identity to match user against
            const invitationIdentities = await IdentityModel.listByPartyId(this.delegate._id);
            Assert.assertTrue(
                invitationIdentities.length === 1,
                'A pending relationship should only have one delegate identity'
            );

            Assert.assertTrue(
                this.invitationIdentity.identityTypeEnum() === IdentityType.InvitationCode,
                'Must be an invitation code to claim'
            );

            Assert.assertTrue(
                this.invitationIdentity.rawIdValue === invitationCode,
                'Invitation code does not match'
            );

            Assert.assertTrue(
                this.invitationIdentity.invitationCodeStatusEnum() === IdentityInvitationCodeStatus.Pending || this.invitationIdentity.invitationCodeStatusEnum() === IdentityInvitationCodeStatus.Claimed,
                'Invitation code must be pending',
                `${this.invitationIdentity.invitationCodeStatusEnum()} != PENDING or CLAIMED`
            );
            Assert.assertTrue(
                this.invitationIdentity.invitationCodeExpiryTimestamp > new Date(),
                'Invitation code has expired'
            );

            // check name
            Assert.assertCaseInsensitiveEqual(
                claimingDelegateIdentity.profile.name.givenName,
                this.invitationIdentity.profile.name.givenName,
                'Identity does not match',
                `${claimingDelegateIdentity.profile.name.givenName} != ${this.invitationIdentity.profile.name.givenName}`
            );

            Assert.assertCaseInsensitiveEqual(
                claimingDelegateIdentity.profile.name.familyName,
                this.invitationIdentity.profile.name.familyName,
                'Identity does not match',
                `${claimingDelegateIdentity.profile.name.familyName} != ${this.invitationIdentity.profile.name.familyName}`
            );

            // TODO not sure about this implementation
            // check date of birth IF it is recorded on the invitation
            if (this.invitationIdentity.profile.getSharedSecret(DOB_SHARED_SECRET_TYPE_CODE)) {
                //
                // Assert.assertTrue(
                //      acceptingDelegateIdentity.profile.getSharedSecret(DOB_SHARED_SECRET_TYPE_CODE)
                //     identity.profile.getSharedSecret(DOB_SHARED_SECRET_TYPE_CODE).matchesValue(),
                //     'Identity does not match');
            }

            // If we received ABN from headers (ie from AUSkey), check it against ABN in relationship
            const abn = context.getAuthenticatedABN();
            logger.debug('abn is <' + abn + '>');
            if (abn) {
                logger.info('checking abn <' + abn + '>');
                const allIdentities = await IdentityModel.listByPartyId(this.subject.id);
                let found: boolean = false;
                for (let identity of allIdentities) {
                    logger.info('abn for identity is ' + identity.rawIdValue);
                    if (identity.rawIdValue === abn) {
                        found = true;
                    }
                }
                Assert.assertTrue(
                    found,
                    'You cannot accept an authorisation with an AUSkey from a different ABN. AUSkeys only have authorisation for the ABN they are issued under.'
                );
            }

            /* complete claim */

            // mark invitation code identity as claimed
            this.invitationIdentity.invitationCodeStatus = IdentityInvitationCodeStatus.Claimed.code;
            this.invitationIdentity.invitationCodeClaimedTimestamp = new Date();
            await this.invitationIdentity.save();

            // point relationship to the accepting delegate identity
            this.delegate = claimingDelegateIdentity.party;
            await this.save();
            return Promise.resolve(this);
    }

    public async acceptPendingInvitation(acceptingDelegateIdentity: IIdentity): Promise<IRelationship> {
        logger.debug('Attempting to accept relationship by ', acceptingDelegateIdentity.idValue);

        Assert.assertTrue(this.statusEnum() === RelationshipStatus.Pending, 'Unable to accept a non-pending relationship');

        // confirm the delegate is the user accepting
        Assert.assertTrue(acceptingDelegateIdentity.party.id === this.delegate.id, 'Not allowed');

        // check identity strength
        logger.info(`checking strength -> identity=${acceptingDelegateIdentity.strength} relationshipType=${this.relationshipType.minIdentityStrength}`);
        Assert.assertGreaterThanEqual(
            acceptingDelegateIdentity.strength,
            this.relationshipType.minIdentityStrength,
            Translator.get('acceptRelationship.insufficientStrength'),
            `${acceptingDelegateIdentity.strength} < ${this.relationshipType.minIdentityStrength}`
        );

        // mark relationship as active
        this.status = RelationshipStatus.Accepted.code;
        await this.save();

        // TODO notify relevant parties

        return Promise.resolve(this as IRelationship);
    }

    // TODO need to include this as part of the PERMISSONS payload
    // TODO refactor to have this logic only once
    private canAccept(): boolean {
        const acceptingDelegateIdentity = context.getAuthenticatedPrincipal().identity;
        return (
            this.statusEnum() === RelationshipStatus.Pending
            && acceptingDelegateIdentity.party.id === this.delegate.id
            && acceptingDelegateIdentity.strength >= this.relationshipType.minIdentityStrength
        );
    }

    public async rejectPendingInvitation(rejectingDelegateIdentity: IIdentity): Promise<IRelationship> {
        Assert.assertTrue(this.statusEnum() === RelationshipStatus.Pending, 'Unable to reject a non-pending relationship');

        // confirm the delegate is the user accepting
        Assert.assertTrue(rejectingDelegateIdentity.party.id === this.delegate.id, 'Not allowed');

        // mark relationship as invalid
        this.status = RelationshipStatus.Declined.code;
        await this.save();

        // TODO notify relevant parties

        return this as IRelationship;
    }

    public async notifyDelegate(email: string, notifyingIdentity: IIdentity): Promise<IRelationship> {
        const identity = this.invitationIdentity;
        // TODO Assert that the user is an administrator of the subject
        // Assert.assertEqual(notifyingIdentity.party.id, this.subject.id, 'Not allowed');
        Assert.assertTrue(this.statusEnum() === RelationshipStatus.Pending, 'Unable to update relationship with delegate email');
        Assert.assertTrue(identity.identityTypeEnum() === IdentityType.InvitationCode, 'Unable to update relationship with delegate email');
        Assert.assertTrue(
            identity.invitationCodeStatusEnum() === IdentityInvitationCodeStatus.Pending,
            'Unable to update relationship with delegate email'
        );

        identity.invitationCodeTemporaryEmailAddress = email;
        await identity.save();

        // TODO notify relevant parties
        //logger.debug(`TODO Send notification to ${email}`);

        return Promise.resolve(this as IRelationship);
    }

}

interface IRelationshipDocument extends IRelationship, mongoose.Document {
}

// static ..............................................................................................................

export class RelationshipModel {

    public static async create(source: IRelationship): Promise<IRelationship> {
        return RelationshipMongooseModel.create(source);
    }

    /* tslint:disable:max-func-body-length */
    public static async addOrModify(identifier: string, dto: DTO): Promise<IRelationship> {

        const myPrincipal = context.getAuthenticatedPrincipal();
        const myIdentity = context.getAuthenticatedIdentity();

        const isNewRelationship = !identifier;

        const relationshipTypeCode = Url.lastPathElement(dto.relationshipType.href);
        Assert.assertNotNull(relationshipTypeCode, 'Relationship type code was empty', `Expected relationshipType href last element to be the code: ${dto.relationshipType.href}`);

        const relationshipType = await RelationshipTypeModel.findByCodeIgnoringDateRange(relationshipTypeCode);
        Assert.assertNotNull(relationshipType, 'Relationship type not found', `Expected relationship type with code with valid date: ${relationshipTypeCode}`);

        const initiatedBy = RelationshipInitiatedBy.valueOf(dto.initiatedBy);
        let subjectIdentity: IIdentity;
        let delegateIdentity: IIdentity;
        let invitationIdentity: IIdentity;
        let startTimestamp: Date;
        let endTimestamp: Date;
        let attributes: IRelationshipAttribute[] = [];

        let relationship: IRelationship;
        if (!isNewRelationship) {
            Assert.assertNotNull(identifier, 'Identifier not found');

            relationship = await RelationshipModel.findByIdentifier(identifier);
            Assert.assertNotNull(relationship, 'Relationship not found');

            attributes = relationship.attributes;
        }

        const subjectIdValue = Url.lastPathElement(dto.subject.href);
        if (subjectIdValue) {
            subjectIdentity = await IdentityModel.findByIdValue(subjectIdValue);
        }

        const delegateIdValue = Url.lastPathElement(dto.delegate.href);
        if (delegateIdValue) {
            delegateIdentity = await IdentityModel.findByIdValue(delegateIdValue);
        }

        // todo if new, start date can not be past only today and future
        // todo if edit, start date can be future and past.
        startTimestamp = dto.startTimestamp;

        // todo end must be after start
        endTimestamp = dto.endTimestamp;

        // todo zero hours
        // startTimestamp.setHours(0, 0, 0);
        // if (endTimestamp) {
        //     endTimestamp.setHours(0, 0, 0);
        // }

        const isSubjectCreatingRelationshipInvitation =
            dto.initiatedBy === RelationshipInitiatedBy.Subject.code
            && dto.delegate.value
            && dto.delegate.value.partyType === PartyType.Individual.code
            && dto.delegate.value.identities.length === 1
            && dto.delegate.value.identities[0].value
            && dto.delegate.value.identities[0].value.identityType === IdentityType.InvitationCode.code
            && dto.delegate.value.identities[0].value.profile.provider === ProfileProvider.Invitation.code;

        if (isSubjectCreatingRelationshipInvitation) {
            const hasSharedSecretValue = dto.delegate.value.identities[0].value.profile.sharedSecrets
                && dto.delegate.value.identities[0].value.profile.sharedSecrets.length === 1
                && dto.delegate.value.identities[0].value.profile.sharedSecrets[0].value;

            delegateIdentity = await IdentityModel.createInvitationCodeIdentity(
                dto.delegate.value.identities[0].value.profile.name.givenName,
                dto.delegate.value.identities[0].value.profile.name.familyName,
                hasSharedSecretValue ? dto.delegate.value.identities[0].value.profile.sharedSecrets[0].value : null
            );
            invitationIdentity = delegateIdentity;
        }

        const isSubjectUpdatingRelationshipInvitation =
            dto.initiatedBy === RelationshipInitiatedBy.Subject.code
            && dto.delegate.href
            && dto.delegate.value
            && dto.delegate.value.partyType === PartyType.Individual.code
            && dto.delegate.value.identities.length === 1
            && dto.delegate.value.identities[0].value
            && dto.delegate.value.identities[0].value.identityType === IdentityType.InvitationCode.code
            && dto.delegate.value.identities[0].value.profile.provider === ProfileProvider.Invitation.code;

        if (isSubjectUpdatingRelationshipInvitation) {
            delegateIdentity.profile.name.givenName = dto.delegate.value.identities[0].value.profile.name.givenName;
            delegateIdentity.profile.name.familyName = dto.delegate.value.identities[0].value.profile.name.familyName;

            const hasSharedSecretValue = dto.delegate.value.identities[0].value.profile.sharedSecrets
                && dto.delegate.value.identities[0].value.profile.sharedSecrets.length === 1
                && dto.delegate.value.identities[0].value.profile.sharedSecrets[0].value;

            delegateIdentity.profile.sharedSecrets = [];
            if (hasSharedSecretValue) {
                const sharedSecretValue = dto.delegate.value.identities[0].value.profile.sharedSecrets[0].value;
                const sharedSecretType = await SharedSecretTypeModel.findByCodeIgnoringDateRange(DOB_SHARED_SECRET_TYPE_CODE);
                const sharedSecret = await SharedSecretModel.create({
                    value: sharedSecretValue,
                    sharedSecretType: sharedSecretType
                } as ISharedSecret);
                delegateIdentity.profile.sharedSecrets.push(sharedSecret);
            }
            invitationIdentity = delegateIdentity;
        }

        Assert.assertNotNull(subjectIdentity, 'Subject identity not found');
        Assert.assertNotNull(delegateIdentity, 'Delegate identity not found');

        if (dto.initiatedBy === RelationshipInitiatedBy.Subject.code) {
            const hasAccess = await PartyModel.hasAccess(subjectIdentity.idValue, myPrincipal, myIdentity);
            if (!hasAccess) {
                throw new Error('403');
            }
        }
        if (dto.initiatedBy === RelationshipInitiatedBy.Delegate.code) {
            const hasAccess = await PartyModel.hasAccess(delegateIdentity.idValue, myPrincipal, myIdentity);
            if (!hasAccess) {
                throw new Error('403');
            }
        }

        const permissionCustomisationAllowed = relationshipType.findAttributeNameUsageByCode('PERMISSION_CUSTOMISATION_ALLOWED_IND');
        let isPermissionAttributeAllowed = permissionCustomisationAllowed !== null && permissionCustomisationAllowed.defaultValue;

        for (let dtoAttribute of dto.attributes) {
            Assert.assertNotNull(dtoAttribute.attributeName, 'Attribute did not have an attribute name');
            Assert.assertNotNull(dtoAttribute.attributeName.href, 'Attribute did not have an attribute name href');

            const attributeNameCode = Url.lastPathElement(dtoAttribute.attributeName.href);
            Assert.assertNotNull(attributeNameCode, 'Attribute name code not found', `Unexpected attribute name href last element: ${dtoAttribute.attributeName.href}`);

            const attributeName = await RelationshipAttributeNameModel.findByCodeIgnoringDateRange(attributeNameCode);
            Assert.assertNotNull(attributeName, 'Attribute name not found', `Expected to find attribute name with code: ${attributeNameCode}`);

            const attributeValue = dtoAttribute.value;

            const isPermissionClassifier = attributeName.classifier === RelationshipAttributeNameClassifier.Permission.code;
            const isOtherClassifier = attributeName.classifier === RelationshipAttributeNameClassifier.Other.code;
            const isAgencyServiceClassifier = attributeName.classifier === RelationshipAttributeNameClassifier.AgencyService.code;

            if (isPermissionClassifier) {

                if (!isPermissionAttributeAllowed) {
                    logger.warn('Found relationship attribute with classifier permission but permission customisation not allowed');
                    throw new Error('400');
                } else {
                    const relationshipAttributeNameCode = Url.lastPathElement(dtoAttribute.attributeName.href);
                    const relationshipAttributeNameUsage = relationshipType.findAttributeNameUsageByCode(relationshipAttributeNameCode);
                    if (relationshipAttributeNameUsage !== null) {

                        let foundAttribute = false;
                        for (let attribute of attributes) {
                            if (attribute.attributeName.code === attributeName.code) {
                                attribute.value = attributeValue;
                                await attribute.save();
                                foundAttribute = true;
                                break;
                            }
                        }
                        if (!foundAttribute) {
                            attributes.push(await RelationshipAttributeModel.add(attributeValue, attributeName));
                        }

                    } else {
                        logger.warn('Relationship attribute not associated with relationship type');
                        throw new Error('400');
                    }
                }

            } else if (isOtherClassifier) {

                const relationshipAttributeNameCode = Url.lastPathElement(dtoAttribute.attributeName.href);
                const relationshipAttributeNameUsage = relationshipType.findAttributeNameUsageByCode(relationshipAttributeNameCode);
                if (relationshipAttributeNameUsage !== null) {

                    let foundAttribute = false;
                    for (let attribute of attributes) {
                        if (attribute.attributeName.code === attributeName.code) {
                            attribute.value = attributeValue;
                            await attribute.save();
                            foundAttribute = true;
                            break;
                        }
                    }
                    if (!foundAttribute) {
                        attributes.push(await RelationshipAttributeModel.add(attributeValue, attributeName));
                    }

                } else {
                    logger.warn('Relationship attribute not associated with relationship type');
                    throw new Error('400');
                }

            } else if (isAgencyServiceClassifier) {

                const relationshipAttributeNameCode = Url.lastPathElement(dtoAttribute.attributeName.href);
                const relationshipAttributeNameUsage = relationshipType.findAttributeNameUsageByCode(relationshipAttributeNameCode);
                if (relationshipAttributeNameUsage !== null) {

                    let foundAttribute = false;
                    for (let attribute of attributes) {
                        if (attribute.attributeName.code === attributeName.code) {
                            attribute.value = attributeValue;
                            await attribute.save();
                            foundAttribute = true;
                            break;
                        }
                    }
                    if (!foundAttribute) {
                        attributes.push(await RelationshipAttributeModel.add(attributeValue, attributeName));
                    }

                } else {
                    logger.warn('Relationship attribute not associated with relationship type');
                    throw new Error('400');
                }

            }
        }

        if (isNewRelationship) {
            let status = RelationshipStatus.Pending;

            // check subject
            if (initiatedBy === RelationshipInitiatedBy.Subject && relationshipType.autoAcceptIfInitiatedFromSubject) {
                status = RelationshipStatus.Accepted;
            }

            // check delegate
            if (initiatedBy === RelationshipInitiatedBy.Delegate && relationshipType.autoAcceptIfInitiatedFromDelegate) {
                status = RelationshipStatus.Accepted;
            }

            return RelationshipModel.create({
                relationshipType: relationshipType,
                subject: subjectIdentity.party,
                subjectNickName: subjectIdentity.profile.name,
                delegate: delegateIdentity.party,
                delegateNickName: delegateIdentity.profile.name,
                startTimestamp: startTimestamp,
                endTimestamp: endTimestamp,
                initiatedBy: initiatedBy.code,
                invitationIdentity: invitationIdentity,
                status: status.code,
                attributes: attributes
                } as any
            );
        } else {
            Assert.assertNotNull(relationship, 'Relationship not found');

            relationship.subject = subjectIdentity.party;
            relationship.delegate = delegateIdentity.party;
            relationship.startTimestamp = startTimestamp;
            relationship.endTimestamp = endTimestamp;
            relationship.invitationIdentity = invitationIdentity;
            relationship.attributes = attributes;

            return relationship.save();
        }
    }

    public static async add(relationshipType: IRelationshipType,
                     subject: IParty,
                     subjectNickName: IName,
                     delegate: IParty,
                     delegateNickName: IName,
                     startTimestamp: Date,
                     endTimestamp: Date,
                     initiatedBy: RelationshipInitiatedBy,
                     invitationIdentity: IIdentity,
                     attributes: IRelationshipAttribute[]): Promise<IRelationship> {

        let status = RelationshipStatus.Pending;

        // check subject
        if (initiatedBy === RelationshipInitiatedBy.Subject && relationshipType.autoAcceptIfInitiatedFromSubject) {
            status = RelationshipStatus.Accepted;
        }

        // check delegate
        if (initiatedBy === RelationshipInitiatedBy.Delegate && relationshipType.autoAcceptIfInitiatedFromDelegate) {
            status = RelationshipStatus.Accepted;
        }

        return RelationshipModel.create({
            relationshipType: relationshipType,
            subject: subject,
            subjectNickName: subjectNickName,
            delegate: delegate,
            delegateNickName: delegateNickName,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp,
            status: status.code,
            initiatedBy: initiatedBy.code,
            invitationIdentity: invitationIdentity,
            attributes: attributes
            } as any
        );

    }

    public static async findOne(conditions: any): Promise<IRelationship> {
        return RelationshipMongooseModel.findOne(conditions).exec();
    }

    public static async findByIdentifier(id: string): Promise<IRelationship> {
        // TODO migrate from _id to another id
        return RelationshipMongooseModel
            .findOne({
                _id: id
            })
            .deepPopulate([
                'relationshipType',
                'subject',
                'subjectNickName',
                'delegate',
                'delegateNickName',
                'invitationIdentity.profile.name',
                'attributes.attributeName'
            ])
            .exec();
    }

    public static async findByInvitationCode(invitationCode: string): Promise<IRelationship> {
        const identity = await IdentityModel.findByInvitationCode(invitationCode);
        if (identity) {
            const delegate = identity.party;
            return RelationshipMongooseModel
                .findOne({
                    invitationIdentity: identity
                })
                .deepPopulate([
                    'relationshipType',
                    'subject',
                    'subjectNickName',
                    'delegate',
                    'delegateNickName',
                    'invitationIdentity.profile.name',
                    'invitationIdentity.profile.sharedSecrets',
                    'attributes.attributeName'
                ])
                .exec();
        }
        return null;
    }

    public static async findPendingByInvitationCodeInDateRange(invitationCode: string, date: Date): Promise<IRelationship> {
        const identity = await IdentityModel.findPendingByInvitationCodeInDateRange(invitationCode, date);
        if (identity) {
            const delegate = identity.party;
            return RelationshipMongooseModel
                .findOne({
                    delegate: delegate
                })
                .deepPopulate([
                    'relationshipType',
                    'subject',
                    'subjectNickName',
                    'delegate',
                    'delegateNickName',
                    'invitationIdentity',
                    'attributes.attributeName'
                ])
                .exec();
        }
        return null;
    }

    // todo what about start date?
    public static async hasActiveInDateRange1stOr2ndLevelConnection(requestingParty: IParty, requestedIdValue: string, date: Date): Promise<boolean> {

        const requestedParty = await PartyModel.findByIdentityIdValue(requestedIdValue);

        if (!requestedParty) {
            // no such subject
            return Promise.resolve(null);
        } else {

            // 1st level

            const firstLevelRelationship = await RelationshipMongooseModel
                .findOne({
                    subject: requestedParty,
                    delegate: requestingParty,
                    status: RelationshipStatus.Accepted.code,
                    startTimestamp: {$lte: date},
                    $or: [{endTimestamp: null}, {endTimestamp: {$gte: date}}]
                })
                .exec();

            if (firstLevelRelationship) {
                return true;
            } else {

                // 2nd level

                const listOfDelegateIds = await RelationshipMongooseModel
                    .aggregate([
                        {
                            '$match': {
                                '$and': [
                                    {'subject': new mongoose.Types.ObjectId(requestedParty.id)},
                                    {'status': RelationshipStatus.Accepted.code},
                                    {'startTimestamp': {$lte: date}},
                                    {'$or': [{endTimestamp: null}, {endTimestamp: {$gte: date}}]}
                                ]
                            }
                        },
                        {'$group': {'_id': '$delegate'}}
                    ])
                    .exec();

                const listOfSubjectIds = await RelationshipMongooseModel
                    .aggregate([
                        {
                            '$match': {
                                '$and': [
                                    {'delegate': new mongoose.Types.ObjectId(requestingParty.id)},
                                    {'status': RelationshipStatus.Accepted.code},
                                    {'startTimestamp': {$lte: date}},
                                    {'$or': [{endTimestamp: null}, {endTimestamp: {$gte: date}}]}
                                ]
                            }
                        },
                        {'$group': {'_id': '$subject'}}
                    ])
                    .exec();

                let arrays = [
                    listOfDelegateIds.map((obj: {_id: string}): string => obj['_id'].toString()),
                    listOfSubjectIds.map((obj: {_id: string}) => obj['_id'].toString())
                ];

                const listOfIntersectingPartyIds = arrays.shift().filter(function (v: string) {
                    return arrays.every(function (a) {
                        return a.indexOf(v) !== -1;
                    });
                });

                return listOfIntersectingPartyIds.length > 0;

            }

        }
    }

    // todo this search might no longer be useful from SS2
    public static async search(subjectIdentityIdValue: string, delegateIdentityIdValue: string, page: number, pageSize: number): Promise<SearchResult<IRelationship>> {
        return new Promise<SearchResult<IRelationship>>(async(resolve, reject) => {
            const thePageSize: number = pageSize ? Math.min(pageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
            try {
                const query = await (new Query()
                    .when(subjectIdentityIdValue, 'subject', () => PartyModel.findByIdentityIdValue(subjectIdentityIdValue))
                    .when(delegateIdentityIdValue, 'delegate', () => PartyModel.findByIdentityIdValue(delegateIdentityIdValue))
                    .build());
                const count = await RelationshipMongooseModel
                    .count(query)
                    .exec();
                const list = await RelationshipMongooseModel
                    .find(query)
                    .deepPopulate([
                        'relationshipType',
                        'subject',
                        'subjectNickName',
                        'delegate',
                        'delegateNickName',
                        'attributes.attributeName'
                    ])
                    .skip((page - 1) * thePageSize)
                    .limit(thePageSize)
                    .sort({name: 1})
                    .exec();
                resolve(new SearchResult<IRelationship>(page, count, thePageSize, list));
            } catch (e) {
                reject(e);
            }
        });
    }

    public static async searchByIdentity(identityIdValue: string,
                                  partyType: string,
                                  relationshipType: string,
                                  relationshipTypeCategory: string,
                                  profileProvider: string,
                                  status: string,
                                  inDateRange: boolean,
                                  text: string,
                                  sort: string,
                                  page: number,
                                  pageSize: number): Promise<SearchResult<IRelationship>> {
        return new Promise<SearchResult<IRelationship>>(async(resolve, reject) => {
            const thePageSize: number = pageSize ? Math.min(pageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
            try {
                const party = await PartyModel.findByIdentityIdValue(identityIdValue);
                let mainAnd: {[key: string]: Object}[] = [];
                mainAnd.push({
                    '$or': [
                        {subject: party},
                        {delegate: party}
                    ]
                });
                if (partyType) {
                    mainAnd.push({
                        '$or': [
                            {'_delegatePartyTypeCode': partyType},
                            {'_subjectPartyTypeCode': partyType}
                        ]
                    });
                }
                if (relationshipType) {
                    mainAnd.push({'_relationshipTypeCode': relationshipType});
                }
                if (relationshipTypeCategory) {
                    mainAnd.push({'_relationshipTypeCategory': relationshipTypeCategory});
                }
                if (profileProvider) {
                    mainAnd.push({
                        '$or': [
                            {'_delegateProfileProviderCodes': profileProvider},
                            {'_subjectProfileProviderCodes': profileProvider}
                        ]
                    });
                }
                if (status) {
                    mainAnd.push({'status': status});
                }
                if (inDateRange) {
                    const date = new Date();
                    mainAnd.push({'startTimestamp': {$lte: date}});
                    mainAnd.push({'$or': [{endTimestamp: null}, {endTimestamp: {$gte: date}}]});
                }
                if (text) {
                    mainAnd.push({
                        '$or': [
                            {'_subjectNickNameString': new RegExp(text, 'i')},
                            {'_delegateNickNameString': new RegExp(text, 'i')},
                            {'_subjectABNString': new RegExp(text, 'i')},
                            {'_delegateABNString': new RegExp(text, 'i')}
                        ]
                    });
                }
                const where: {[key: string]: Object} = {};
                where['$and'] = mainAnd;
                const count = await RelationshipMongooseModel
                    .count(where)
                    .exec();
                const list = await RelationshipMongooseModel
                    .find(where)
                    .deepPopulate([
                        'relationshipType',
                        'subject',
                        'subjectNickName',
                        'delegate',
                        'delegateNickName',
                        'attributes.attributeName'
                    ])
                    .sort({
                        '_subjectNickNameString': !sort || sort === 'asc' ? 1 : -1,
                        '_delegateNickNameString': !sort || sort === 'asc' ? 1 : -1
                    })
                    .skip((page - 1) * thePageSize)
                    .limit(thePageSize)
                    .exec();
                resolve(new SearchResult<IRelationship>(page, count, thePageSize, list));
            } catch (e) {
                reject(e);
            }
        });
    }

    public static async searchByIdentitiesInDateRange(subjectIdValue: string,
                                               delegateIdValue: string,
                                               relationshipType: string,
                                               status: string,
                                               date: Date,
                                               page: number,
                                               pageSize: number): Promise<SearchResult<IRelationship>> {
        return new Promise<SearchResult<IRelationship>>(async(resolve, reject) => {
            const thePageSize: number = pageSize ? Math.min(pageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
            try {
                const subject = await PartyModel.findByIdentityIdValue(subjectIdValue);
                const delegate = await PartyModel.findByIdentityIdValue(delegateIdValue);
                let mainAnd: {[key: string]: Object}[] = [];
                mainAnd.push({'subject': subject});
                mainAnd.push({'delegate': delegate});
                if (relationshipType) {
                    mainAnd.push({'_relationshipTypeCode': relationshipType});
                }
                if (status) {
                    mainAnd.push({'status': status});
                }
                const date = new Date();
                mainAnd.push({'startTimestamp': {$lte: date}});
                mainAnd.push({'$or': [{endTimestamp: null}, {endTimestamp: {$gte: date}}]});
                const where: {[key: string]: Object} = {};
                where['$and'] = mainAnd;
                const count = await RelationshipMongooseModel
                    .count(where)
                    .exec();
                const list = await RelationshipMongooseModel
                    .find(where)
                    .deepPopulate([
                        'relationshipType',
                        'subject',
                        'subjectNickName',
                        'delegate',
                        'delegateNickName',
                        'attributes.attributeName'
                    ])
                    .sort({
                        '_subjectNickNameString': 1,
                        '_delegateNickNameString': 1
                    })
                    .skip((page - 1) * thePageSize)
                    .limit(thePageSize)
                    .exec();
                resolve(new SearchResult<IRelationship>(page, count, thePageSize, list));
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Returns a paginated list of distinct subjects for relationships which have a delegate matching the one supplied.
     *
     * todo need to optional filters (authorisation management)
     */
    public static async searchDistinctSubjectsForMe(requestingParty: IParty, partyType: string, authorisationManagement: string, text: string, sort: string, page: number, pageSize: number): Promise<SearchResult<IParty>> {
        return new Promise<SearchResult<IParty>>(async(resolve, reject) => {
            const thePageSize: number = pageSize ? Math.min(pageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
            try {
                const where: {[key: string]: Object} = {
                    '$match': {
                        '$and': [{'delegate': new mongoose.Types.ObjectId(requestingParty.id)}]
                    }
                };
                if (partyType) {
                    where['$match']['$and'].push({'_subjectPartyTypeCode': partyType});
                }
                // todo authorisation management
                if (text) {
                    where['$match']['$and'].push({
                        '$or': [
                            {'_subjectNickNameString': new RegExp(text, 'i')},
                            {'_subjectABNString': new RegExp(text, 'i')},
                        ]
                    });
                }
                const count = (await RelationshipMongooseModel
                    .aggregate([
                        where,
                        {'$group': {'_id': '$subject'}}
                    ])
                    .exec()).length;
                const listOfIds = await RelationshipMongooseModel
                    .aggregate([
                        where,
                        {'$group': {'_id': '$subject'}}
                    ])
                    .sort({
                        '_subjectNickNameString': !sort || sort === 'asc' ? 1 : -1
                    })
                    .skip((page - 1) * thePageSize)
                    .limit(thePageSize)
                    .exec();
                let wrappedPartyList: IParty[] = await PartyModel.populate(listOfIds, {path: '_id'});
                const unwrappedPartyList = wrappedPartyList.map((item: {_id: IParty}) => item._id);
                resolve(new SearchResult<IParty>(page, count, thePageSize, unwrappedPartyList));
            } catch (e) {
                reject(e);
            }
        });
    }

}

// concrete model .....................................................................................................

RelationshipMongooseModel = Model(
    'Relationship',
    RelationshipSchema,
    Relationship
) as mongoose.Model<IRelationshipDocument>;
