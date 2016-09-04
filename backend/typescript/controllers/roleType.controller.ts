import {Router, Request, Response} from 'express';
import {context} from '../providers/context.provider';
import {
    sendResource, sendList, sendError, sendNotFoundError, validateReqSchema
} from './helpers';
import {RoleTypeModel} from '../models/roleType.model';

// todo add data security
export class RoleTypeController {

    private listIgnoringDateRange = async(req: Request, res: Response) => {
        const schema = {};
        validateReqSchema(req, schema)
            .then((req: Request) => RoleTypeModel.listIgnoringDateRange())
            .then((results) => results ? results.map((model) => model.toHrefValue(true)) : null)
            .then(sendList(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private findByCodeIgnoringDateRange = async(req: Request, res: Response) => {
        const schema = {
            'code': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Code is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req: Request) => RoleTypeModel.findByCodeIgnoringDateRange(req.params.code))
            .then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router: Router) => {

        router.get('/v1/roleTypes',
            context.begin,
            this.listIgnoringDateRange);

        router.get('/v1/roleType/:code',
            context.begin,
            this.findByCodeIgnoringDateRange);

        return router;

    };

}
