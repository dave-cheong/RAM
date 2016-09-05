import {Router, Request, Response} from 'express';
import {context} from '../providers/context.provider';
import {sendResource, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {Url} from '../models/url';
import {ITransactRequest, TransactResponse} from '../../../commons/api';
import {RoleStatus, RoleModel} from '../models/role.model';
import {RelationshipStatus, RelationshipModel} from '../models/relationship.model';
import {IdentityModel} from '../models/identity.model';

export class TransactController {

    private allowed = async(req: Request, res: Response) => {

        const schema = {
            'clientABN': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Client ABN is not valid'
            },
            'ssid': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'SSID is not valid'
            },
            'agencyService': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Agency Service is not valid'
            }
        };

        const auskey = context.getAuthenticatedAUSkey();
        const abn = context.getAuthenticatedABN();
        const request = req.body as ITransactRequest;
        const ospIdentityIdValue = Url.abnIdValue(abn);
        const clientIdentityIdValue = Url.abnIdValue(request.clientABN);

        validateReqSchema(req, schema)

            .then(async(req: Request) => {

                // ensure auskey and abn authentication supplied
                if (!auskey || !abn) {
                    throw new Error('401');
                }

                // ensure OSP role
                const ospRoles = await RoleModel.searchByIdentity(ospIdentityIdValue, 'OSP', RoleStatus.Active.code, true, 1, 10);
                if (ospRoles.list.length === 0) {
                    throw new Error('401:Organisation is not an Online Service Provider');
                }
                const ospRole = ospRoles.list[0];

                // ensure client ABN
                const clientIdentity = await IdentityModel.findByIdValue(clientIdentityIdValue);
                if (!clientIdentity) {
                    throw new Error('400:Client ABN does not exist');
                }

                // ensure agency service matches
                let roleAgencyServiceMatched = false;
                const attributes = await ospRole.getAgencyServiceAttributesInDateRange(new Date());
                for (let attribute of attributes) {
                    if (attribute.attributeName.code === request.agencyService) {
                        roleAgencyServiceMatched = true;
                    }
                }
                if (!roleAgencyServiceMatched) {
                    throw new Error('401:Role Agency Service does not match');
                }

                // ensure device AUSkey matches
                let auskeyMatched = false;
                for (let attribute of ospRole.attributes) {
                    if (attribute.attributeName.code === 'DEVICE_AUSKEYS') {
                        if (attribute.value) {
                            for (let value of attribute.value) {
                                if (value === auskey) {
                                    auskeyMatched = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!auskeyMatched) {
                    throw new Error('401:AUSkey does not match');
                }

                // ensure there is a valid OSP relationship between the two parties
                const acceptedOspRelationshipSearchResult = await RelationshipModel.searchByIdentitiesInDateRange(clientIdentityIdValue, ospIdentityIdValue, 'OSP', RelationshipStatus.Accepted.code, new Date(), 1, 10);
                if (acceptedOspRelationshipSearchResult.list.length === 0) {
                    throw new Error('401:Relationship not found');
                }
                const acceptedOspRelationship = acceptedOspRelationshipSearchResult.list[0];

                // ensure the relationship has enabled the requested agency service
                let relationshipAgencyServiceMatched = false;
                for (let attribute of acceptedOspRelationship.attributes) {
                    if (attribute.attributeName.code === 'SELECTED_GOVERNMENT_SERVICES_LIST') {
                        if (attribute.value) {
                            for (let value of attribute.value) {
                                if (value === request.agencyService) {
                                    relationshipAgencyServiceMatched = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!relationshipAgencyServiceMatched) {
                    throw new Error('401:Relationship Agency Service does not match');
                }

                // ensure the relationship has the requested SSID
                let relationshipSSIDMatched = false;
                for (let attribute of acceptedOspRelationship.attributes) {
                    if (attribute.attributeName.code === 'SSID') {
                        if (attribute.value) {
                            for (let value of attribute.value) {
                                if (value === request.ssid) {
                                    relationshipSSIDMatched = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!relationshipSSIDMatched) {
                    throw new Error('401:Relationship SSID does not match');
                }

                const allowed = true;
                return new TransactResponse(request, allowed);

            })

            //.then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));

    };

    public assignRoutes = (router: Router) => {

        router.post('/v1/transact/allowed',
            context.begin,
            this.allowed);

        return router;

    }

}