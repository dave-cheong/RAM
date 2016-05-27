import RelationshipTypeSteps from './steps/relationshipTypes';

const relationshipTypeSteps = new RelationshipTypeSteps();

describe('RelationshipType API', () => {

    it('spike', async(done) => {

        const code = 'BUSINESS_REPRESENTATIVE';

        try {

            const response = await relationshipTypeSteps.findByCode(code);

            const relationshipType = response.body.data;

            relationshipTypeSteps.validateRelationshipType(relationshipType);

            expect(relationshipType.code).toBe(code);
            expect(relationshipType.shortDecodeText).toBe('Business Representative');

        } catch (e) {
            fail('failed me');
        }

        done();
    });

    it('can find by code', async(done) => {

        const code = 'BUSINESS_REPRESENTATIVE';

        relationshipTypeSteps.findByCode(code)
            .then((response) => {

                const relationshipType = response.body.data;

                relationshipTypeSteps.validateRelationshipType(relationshipType);

                expect(relationshipType.code).toBe(code);
                expect(relationshipType.shortDecodeText).toBe('Business Representative');

                done();
            })
            .catch((err) => {
                fail('Error encountered ' + err);
                done();
            });
    });

    it('returns 404 for unknown code', async(done) => {

        const code = 'NOT_FOUND';

        relationshipTypeSteps.findByCode(code)
            .then((response) => {
                fail('Expected 404');
                done();
            })
            .catch((err) => {
                expect(err.status).toBe(404);
                expect(err.response.body.status).toBe(404);
                done();
            });
    });

    it('can list current', async(done) => {

        relationshipTypeSteps.listAllCurrent()
            .then((response) => {

                const relationshipTypes = response.body.data;

                expect(relationshipTypes.length > 0).toBeTruthy();
                for(let item of relationshipTypes) {
                    relationshipTypeSteps.validateRelationshipType(item);
                }
                done();
            })
            .catch((err) => {
                fail('Error encountered ' + err);
                done();
            });
    });

    // TODO create

    // TODO update

});

