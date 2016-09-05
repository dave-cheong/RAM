import RelationshipHelper from './helpers/relationshipHelper';
import InitializationHelper from './helpers/initializationHelper';
import AuthHelper from './helpers/authHelper';

const relationshipHelper = new RelationshipHelper();
const initializationHelper = new InitializationHelper();
const authHelper = new AuthHelper();

/* tslint:disable:max-func-body-length */
describe('Relationship API', () => {

    beforeAll(async(done) => {
        try {
            await initializationHelper.loadData();
        } catch (e) {
            fail(e);
        }
        done();
    });

    afterAll((done) => {
        done();
    });

    it('can list by subject', async(done) => {

        try {
            const identity = authHelper.KNOWN_IDENTITIES['jenscatering_identity_1'];
            await authHelper.logIn(identity);

            const response = await relationshipHelper.subject(identity, 1, 10);
            relationshipHelper.validateRelationshipList(response.body.list);

        } catch (e) {
            fail(e);
        }

        done();
    });

    it('can list by delegate', async(done) => {

        try {
            const identity = authHelper.KNOWN_IDENTITIES['jennifermaxims_identity_1'];
            await authHelper.logIn(identity);

            const response = await relationshipHelper.delegate(identity, 1, 10);
            relationshipHelper.validateRelationshipList(response.body.list);

        } catch (e) {
            fail(e);
        }

        done();
    });
});