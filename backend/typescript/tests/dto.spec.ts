import {Builder} from '../../../commons/api';

// person .............................................................................................................

interface IPersonDTO {
    name: string;
    age: number;
    mum: IPersonDTO;
    children: IPersonDTO[];
    pet: IPetDTO;
    nameAndAge(): string;
}

class PersonDTO implements IPersonDTO {

    public static build(sourceObject: any): IPersonDTO {
        return new Builder<IPersonDTO>(sourceObject, this)
            .map('mum', PersonDTO)
            .mapArray('children', PersonDTO)
            .map('pet', PetDTO)
            .build();
    }

    constructor(public name: string, public age: number, public mum: IPersonDTO, public children: IPersonDTO[], public pet: IPetDTO) {
    }

    public nameAndAge(): string {
        return this.name + ' ' + this.age;
    }

}

// pet ................................................................................................................

interface IPetDTO {
    type: string;
    name: string;
    speak(): string;
}

class PetDTO implements IPetDTO {

    public static build(sourceObject: any): IPetDTO {
        return new Builder<IPetDTO>(sourceObject, this)
            .build();
    }

    constructor(public type: string, public name: string) {
    }

    public speak(): string {
        return this.name + ' speaks in ' + this.type + ' language';
    }

}

// tests ..............................................................................................................

const mumName = 'Mum';
const mumAge = 80;
const myName = 'Bob';
const myAge = 10;
const child1Name = 'Child 1';
const child1Age = 1;
const pet1Name = 'Spot';
const pet1Type = 'dog';

/* tslint:disable:max-func-body-length */
describe('RAM DTO', () => {

    beforeEach(async(done) => {
        done();
    });

    it('instantiates with all arg constructor', async(done) => {
        try {

            const mum = new PersonDTO(mumName, mumAge, null, null, null);
            const me = new PersonDTO(myName, myAge, mum, null, null);

            expect(me.name).toBe(myName);
            expect(me.age).toBe(myAge);
            expect(me.mum.name).toBe(mumName);
            expect(me.mum.age).toBe(mumAge);
            expect(me.nameAndAge()).toBe(myName + ' ' + myAge);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('instantiates with no arg constructor', async(done) => {
        try {

            const me = Object.create(PersonDTO.prototype);
            me.name = myName;
            me.age = myAge;

            expect(me.name).toBe(myName);
            expect(me.age).toBe(myAge);
            expect(me.nameAndAge()).toBe(myName + ' ' + myAge);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('instantiates with reflective constructor', async(done) => {
        try {

            const meLike: any = {
                name: myName,
                age: myAge,
                mum: {
                    name: mumName,
                    age: mumAge,
                    mum: null
                },
                children: [
                    {
                        name: child1Name,
                        age: child1Age,
                        mum: null
                    }
                ],
                pet: {
                    type: 'dog',
                    name: 'Spot'
                }
            };

            const me = PersonDTO.build(meLike);

            expect(me.name).toBe(myName);
            expect(me.age).toBe(myAge);
            expect(me.mum).not.toBeNull();
            expect(me.mum.name).toBe(mumName);
            expect(me.mum.age).toBe(mumAge);
            expect(me.nameAndAge()).toBe(myName + ' ' + myAge);
            expect(me.children).not.toBeNull();
            expect(me.children.length).toBe(1);
            expect(me.children[0].name).toBe(child1Name);
            expect(me.children[0].age).toBe(child1Age);
            expect(me.children[0].nameAndAge()).toBe(child1Name + ' ' + child1Age);
            expect(me.pet).not.toBeNull();
            expect(me.pet.name).toBe(pet1Name);
            expect(me.pet.type).toBe(pet1Type);
            expect(me.pet.speak()).toBe(pet1Name + ' speaks in ' + pet1Type + ' language');

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('instantiates with a regular object using a bad programming pattern', async(done) => {
        try {

            const me: IPersonDTO = {
                name: myName,
                age: myAge,
                mum: null,
                children: null,
                pet: null,
                nameAndAge: function (): string {
                    return null;
                }
            };

            expect(me.name).toBe(myName);
            expect(me.age).toBe(myAge);
            expect(me.nameAndAge()).toBe(null);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

    it('ignores injected functions', async(done) => {
        try {

            const meLike: any = {
                name: myName,
                age: myAge,
                mum: function() {
                    console.log('mum as an unsafe function');
                },
                dad: function() {
                    console.log('dad as an unsafe function');
                },
                children: []
            };

            const me = PersonDTO.build(meLike);

            expect(me.mum).toBeFalsy();
            expect(me['dad']).toBeFalsy();

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

});