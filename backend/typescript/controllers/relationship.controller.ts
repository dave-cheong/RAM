import {Router, Request, Response} from 'express';
import {context} from '../providers/context.provider';
import {
    sendResource,
    sendList,
    sendSearchResult,
    sendError,
    sendNotFoundError,
    validateReqSchema,
    REGULAR_CHARS
} from './helpers';
import {IPartyModel, PartyModel} from '../models/party.model';
import {IRelationshipModel, RelationshipStatus, RelationshipModel} from '../models/relationship.model';
import {
    FilterParams,
    IInvitationCodeRelationshipAddDTO,
    ICreateInvitationCodeDTO,
    IAttributeDTO
} from '../../../commons/RamAPI';
import {Headers} from './headers';

// todo add data security
export class RelationshipController {

    constructor(private relationshipModel:IRelationshipModel, private partyModel:IPartyModel) {
    }

    private findByIdentifier = async(req:Request, res:Response) => {
        const schema = {
            'identifier': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Identifier is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.findByIdentifier(req.params.identifier))
            .then((model) => model ? model.toDTO(null) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private findByInvitationCode = async(req:Request, res:Response) => {
        const schema = {
            'invitationCode': {
                notEmpty: true,
                errorMessage: 'Invitation Code is not valid'
            }
        };
        const invitationCode = req.params.invitationCode;
        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.findByInvitationCode(invitationCode))
            .then((model) => model ? model.toDTO(invitationCode) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private claimByInvitationCode = async(req:Request, res:Response) => {
        const schema = {
            'invitationCode': {
                notEmpty: true,
                errorMessage: 'Invitation Code is not valid'
            }
        };
        const invitationCode = req.params.invitationCode;
        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.findByInvitationCode(invitationCode))
            .then((model) => model ? model.claimPendingInvitation(context.getAuthenticatedIdentity(), invitationCode) : null)
            .then((model) => model ? model.toDTO(invitationCode) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private acceptByInvitationCode = async(req:Request, res:Response) => {
        const schema = {
            'invitationCode': {
                notEmpty: true,
                errorMessage: 'Invitation Code is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.findByInvitationCode(req.params.invitationCode))
            .then((model) => model ? model.acceptPendingInvitation(context.getAuthenticatedIdentity()) : null)
            .then((model) => model ? model.toDTO(null) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private rejectByInvitationCode = async(req:Request, res:Response) => {
        const schema = {
            'invitationCode': {
                notEmpty: true,
                errorMessage: 'Invitation Code is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.findByInvitationCode(req.params.invitationCode))
            .then((model) => model ? model.rejectPendingInvitation(context.getAuthenticatedIdentity()) : null)
            .then((model) => model ? Promise.resolve({}) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private notifyDelegateByInvitationCode = async(req:Request, res:Response) => {
        const schema = {
            'invitationCode': {
                notEmpty: true,
                errorMessage: 'Invitation Code is not valid'
            },
            'email': {
                in: 'body',
                notEmpty: true,
                isEmail: {
                    errorMessage: 'Email is not valid'
                },
                errorMessage: 'Email is not supplied'
            }
        };

        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.findPendingByInvitationCodeInDateRange(req.params.invitationCode, new Date()))
            .then((model) => model ? model.notifyDelegate(req.body.email, context.getAuthenticatedIdentity()) : null)
            .then((model) => model ? model.toDTO(null) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    /* tslint:disable:max-func-body-length */
    // todo this search might no longer be useful from SS2
    private searchBySubjectOrDelegate = async(req:Request, res:Response) => {
        const schema = {
            'subject_or_delegate': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Subject Or Delegate is not valid',
                matches: {
                    options: ['^(subject|delegate)$'],
                    errorMessage: 'Subject Or Delegate is not valid'
                }
            },
            'identity_id': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Identity Id is not valid'
            },
            'page': {
                in: 'query',
                notEmpty: true,
                isNumeric: {
                    errorMessage: 'Page is not valid'
                }
            },
            'pageSize': {
                in: 'query',
                optional: true,
                isNumeric: {
                    errorMessage: 'Page Size is not valid'
                }
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => this.relationshipModel.search(
                req.params.subject_or_delegate === 'subject' ? req.params.identity_id : null,
                req.params.subject_or_delegate === 'delegate' ? req.params.identity_id : null,
                parseInt(req.query.page),
                req.query.pageSize ? parseInt(req.query.pageSize) : null)
            )
            .then((results) => (results.map((model) => model.toHrefValue(true))))
            .then(sendSearchResult(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    /* tslint:disable:max-func-body-length */
    private searchByIdentity = async(req:Request, res:Response) => {
        const schema = {
            'identity_id': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Identity Id is not valid'
            },
            'filter': {
                in: 'query'
            },
            'page': {
                in: 'query',
                notEmpty: true,
                isNumeric: {
                    errorMessage: 'Page is not valid'
                }
            },
            'pageSize': {
                in: 'query',
                optional: true,
                isNumeric: {
                    errorMessage: 'Page Size is not valid'
                }
            }
        };
        const filterParams = FilterParams.decode(req.query.filter);
        validateReqSchema(req, schema)
            .then(async (req:Request) => {
                const myPrincipal = context.getAuthenticatedPrincipal();
                const myIdentity = context.getAuthenticatedIdentity();
                const hasAccess = await this.partyModel.hasAccess(req.params.identity_id, myPrincipal, myIdentity);
                if (!hasAccess) {
                    throw new Error('403');
                }
                return req;
            })
            .then((req:Request) => this.relationshipModel.searchByIdentity(
                req.params.identity_id,
                filterParams.get('partyType'),
                filterParams.get('relationshipType'),
                filterParams.get('relationshipTypeCategory'),
                filterParams.get('profileProvider'),
                filterParams.get('status'),
                false,
                filterParams.get('text'),
                filterParams.get('sort'),
                parseInt(req.query.page),
                req.query.pageSize ? parseInt(req.query.pageSize) : null)
            )
            .then((results) => (results.map((model) => model.toHrefValue(true))))
            .then(sendSearchResult(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private searchDistinctSubjectsForMe = async (req:Request, res:Response) => {
        const schema = {
            'filter': {
                in: 'query'
            },
            'page': {
                in: 'query',
                notEmpty: true,
                isNumeric: {
                    errorMessage: 'Page is not valid'
                }
            },
            'pageSize': {
                in: 'query',
                optional: true,
                isNumeric: {
                    errorMessage: 'Page Size is not valid'
                }
            }
        };
        const filterParams = FilterParams.decode(req.query.filter);
        validateReqSchema(req, schema)
            .then((req: Request) => {
                const principal = context.getAuthenticatedPrincipal();
                if (principal.agencyUserInd) {
                    throw new Error('403');
                } else {
                    return this.relationshipModel.searchDistinctSubjectsForMe(
                        res.locals[Headers.Identity].party,
                        filterParams.get('partyType'),
                        filterParams.get('authorisationManagement'),
                        filterParams.get('text'),
                        filterParams.get('sort'),
                        parseInt(req.query.page),
                        req.query.pageSize);
                }
            })
            .then((results) => (results.map((model) => model.toHrefValue(true))))
            .then(sendSearchResult(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private createUsingInvitation = async(req:Request, res:Response) => {
        // TODO support other party types - currently only INDIVIDUAL is supported here
        // TODO how much of this validation should be in the data layer?
        // TODO decide how to handle dates - should they include time? or should server just use 12am AEST
        const schemaB2I = {
            'relationshipType': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Relationship type is not valid'
            },
            'subjectIdValue': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Subject is not valid'
            },
            'startTimestamp': {
                in: 'body',
                notEmpty: true,
                isDate: {
                    errorMessage: 'Start timestamp is not valid'
                },
                errorMessage: 'Start timestamp is not valid'
            },
            'endTimestamp': {
                in: 'body'
            },
            'delegate.partyType': {
                in: 'body',
                matches: {
                    options: ['^(INDIVIDUAL)$'],
                    errorMessage: 'Delegate Party Type is not valid'
                }
            },
            'delegate.givenName': {
                in: 'body',
                notEmpty: true,
                isLength: {
                    options: [{min: 1, max: 200}],
                    errorMessage: 'Delegate Given Name must be between 1 and 200 chars long'
                },
                matches: {
                    options: [REGULAR_CHARS],
                    errorMessage: 'Delegate Given Name contains illegal characters'
                },
                errorMessage: 'Delegate Given Name is not valid'
            },
            'delegate.familyName': {
                in: 'body',
                optional: true,
                isLength: {
                    options: [{min: 0, max: 200}],
                    errorMessage: 'Delegate Family Name must be between 0 and 200 chars long'
                },
                matches: {
                    options: [REGULAR_CHARS],
                    errorMessage: 'Delegate Family Name contains illegal characters'
                },
                errorMessage: 'Delegate Family Name is not valid'
            },
            'delegate.sharedSecretTypeCode': {
                in: 'body',
                notEmpty: true,
                matches: {
                    options: ['^(DATE_OF_BIRTH)$'],
                    errorMessage: 'Delegate Shared Secret Type Code is not valid'
                }
            },
            'delegate.sharedSecretValue': {
                in: 'body'
            }
        };

        validateReqSchema(req, schemaB2I)
            .then((req: Request) => {
                return PartyModel.findByIdentityIdValue(req.body.subjectIdValue);
            })
            .then((subjectParty) => {

                const delegateIdentity: ICreateInvitationCodeDTO = {
                    givenName: req.body.delegate.givenName,
                    familyName: req.body.delegate.familyName,
                    sharedSecretValue: req.body.delegate.sharedSecretValue
                };

                const attributes: IAttributeDTO[] = [];
                for (let attribute of req.body.attributes) {
                    attributes.push({
                        code: attribute.code,
                        value: attribute.value
                    });
                }

                const relationshipAddDTO: IInvitationCodeRelationshipAddDTO = {
                    relationshipType: req.body.relationshipType,
                    subjectIdValue: req.body.subjectIdValue,
                    delegate: delegateIdentity,
                    startTimestamp: req.body.startTimestamp ? new Date(req.body.startTimestamp) : undefined,
                    endTimestamp: req.body.endTimestamp ? new Date(req.body.endTimestamp) : undefined,
                    attributes: attributes
                };
                return subjectParty.addRelationship(relationshipAddDTO);
            })
            .then((model) => model ? model.toDTO(null) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private create = async(req:Request, res:Response) => {

        const schema = {
            'identifier': {
                in: 'params'
            },
            'relationshipType.href': {
                in: 'body',
                matches: {
                    options: ['^/api/v1/relationshipType/'],
                    errorMessage: 'Relationship type is not valid'
                }
            },
            // 'subject.href': {
            //     in: 'body',
            //     matches: {
            //         options: ['^/api/v1/party/identity/'],
            //         errorMessage: 'Subject identity id value not valid'
            //     }
            // },
            // 'delegate.href': {
            //     in: 'body',
            //     matches: {
            //         options: ['^/api/v1/party/identity/'],
            //         errorMessage: 'Delegate identity id value not valid'
            //     }
            // },
            // 'startTimestamp': {
            //     in: 'body',
            //     notEmpty: true,
            //     isDate: {
            //         errorMessage: 'Start timestamp is not valid'
            //     },
            //     errorMessage: 'Start timestamp is not valid'
            // },
            // 'endTimestamp': {
            //     in: 'body'
            // }
        };
        validateReqSchema(req, schema)
            .then((req: Request) => RelationshipModel.addOrModify(req.params.identifier, req.body))
            .then((model) => model ? model.toDTO(null) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private modify = async(req:Request, res:Response) => {
        const schema = {
            'identifier': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Relationship identity value not valid'
            },
            'relationshipType.href': {
                in: 'body',
                matches: {
                    options: ['^/api/v1/relationshipType/'],
                    errorMessage: 'Relationship type is not valid'
                }
            },
            'subject.href': {
                in: 'body',
                matches: {
                    options: ['^/api/v1/party/identity/'],
                    errorMessage: 'Subject identity id value not valid'
                }
            },
            'delegate.href': {
                in: 'body',
                matches: {
                    options: ['^/api/v1/party/identity/'],
                    errorMessage: 'Delegate identity id value not valid'
                }
            },
            'startTimestamp': {
                in: 'body',
                notEmpty: true,
                // isDate: {
                //     errorMessage: 'Start timestamp is not valid'
                // },
                // todo resolve issue
                errorMessage: 'Start timestamp is not valid'
            },
            'endTimestamp': {
                in: 'body'
            }
        };
        validateReqSchema(req, schema)
            .then((req: Request) => RelationshipModel.addOrModify(req.params.identifier, req.body))
            .then((model) => model ? model.toDTO(null) : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private findStatusByCode = (req:Request, res:Response) => {
        const schema = {
            'code': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Code is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => RelationshipStatus.valueOf(req.params.code) as RelationshipStatus)
            .then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch((err) => sendError(res)(err));
    };

    private listStatuses = (req:Request, res:Response) => {
        const schema = {};
        validateReqSchema(req, schema)
            .then((req:Request) => RelationshipStatus.values() as RelationshipStatus[])
            .then((results) => results ? results.map((model) => model.toHrefValue(true)) : null)
            .then(sendList(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router:Router) => {

        router.get('/v1/relationship/:identifier',
            context.begin,
            context.isAuthenticated,
            this.findByIdentifier);

        router.get('/v1/relationship/invitationCode/:invitationCode',
            context.begin,
            context.isAuthenticated,
            this.findByInvitationCode);

        router.post('/v1/relationship/invitationCode/:invitationCode/claim',
            context.begin,
            context.isAuthenticated,
            this.claimByInvitationCode);

        router.post('/v1/relationship/invitationCode/:invitationCode/accept',
            context.begin,
            context.isAuthenticated,
            this.acceptByInvitationCode);

        router.post('/v1/relationship/invitationCode/:invitationCode/reject',
            context.begin,
            context.isAuthenticated,
            this.rejectByInvitationCode);

        router.post('/v1/relationship/invitationCode/:invitationCode/notifyDelegate',
            context.begin,
            context.isAuthenticated,
            this.notifyDelegateByInvitationCode);

        router.get('/v1/relationships/:subject_or_delegate/identity/:identity_id',
            context.begin,
            context.isAuthenticated,
            this.searchBySubjectOrDelegate);

        router.get('/v1/relationships/identity/subjects',
            context.begin,
            context.isAuthenticated,
            this.searchDistinctSubjectsForMe);

        router.get('/v1/relationships/identity/:identity_id',
            context.begin,
            context.isAuthenticated,
            this.searchByIdentity);

        router.post('/v1/relationship-by-invitation',
            context.begin,
            context.isAuthenticated,
            this.createUsingInvitation);

        // todo need to add to swagger
        router.post('/v1/relationship',
            context.begin,
            context.isAuthenticated,
            this.create);

        router.put('/v1/relationship/:identifier',
            context.begin,
            context.isAuthenticated,
            this.modify);

        router.get('/v1/relationshipStatus/:code',
            context.begin,
            this.findStatusByCode);

        router.get('/v1/relationshipStatuses',
            context.begin,
            this.listStatuses);

        return router;

    };
}
