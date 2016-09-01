// person .............................................................................................................

interface IPersonDTO {
    name: string;
    age: number;
    nameAndAge(): string;
}

class PersonDTO implements IPersonDTO {

    constructor(public name: string, public age: number) {
    }

    public nameAndAge(): string {
        return this.name + ' ' + this.age;
    }

}

// tests ..............................................................................................................

const mumName = 'Mum';
const mumAge = 80;

/* tslint:disable:max-func-body-length */
describe('Javascript', () => {

    beforeEach(async(done) => {
        done();
    });

    it('hasOwnProperty', async(done) => {
        try {
            {
                const person = new PersonDTO(mumName, mumAge);
                expect(person.hasOwnProperty('name')).toBe(true);
                expect(person.hasOwnProperty('unknown')).toBe(false);
            }
            {
                const person = Object.create(PersonDTO.prototype);
                expect(person.hasOwnProperty('name')).toBe(false);
                expect(person.hasOwnProperty('unknown')).toBe(false);
            }

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('getOwnPropertyNames', async(done) => {
        try {
            expect(Object.getOwnPropertyNames(PersonDTO.prototype).length).toBe(2);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

});