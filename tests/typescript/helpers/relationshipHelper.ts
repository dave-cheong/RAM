import {RestCalls} from '../support/rest';
import {config} from '../bootstrap';
import {HrefValue, Relationship} from '../../../commons/api';

const rest = new RestCalls(config.host, config.port);

/**
 * Reusable test steps for the Relationship REST API.
 *
 * Use these steps for any tests that need to interact with the Relationship REST API.
 */
export default class RelationshipHelper {

    public findByIdentifier = (code:string) => {
        return rest.promisify(rest.get(`/v1/relationship/${code}`));
    };

    public subject = (identity_id:string, page:number, pageSize:number) => {
        return rest.promisify(rest.get(`/v1/relationships/subject/identity/${identity_id}?page=${page}&pageSize=${pageSize}`));
    };

    public delegate = (identity_id:string, page:number, pageSize:number) => {
        return rest.promisify(rest.get(`/v1/relationships/delegate/identity/${identity_id}?page=${page}&pageSize=${pageSize}`));
    };

    public validateRelationshipList = (relationshipList:HrefValue<Relationship>[]) => {
        expect(relationshipList.length > 0).toBeTruthy();
        for (let item of relationshipList) {
            this.validateRelationship(item.value);
        }
    };

    public validateRelationship = (relationship:Relationship) => {
        expect(relationship.relationshipType).toBeDefined();
        expect(relationship.subject).toBeDefined();
        expect(relationship.delegate).toBeDefined();
    };
}