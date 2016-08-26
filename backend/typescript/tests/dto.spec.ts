class Builder<T> {

    constructor(public sourceObject: any, public targetObject: any) {
    }

    public map(key: string, targetClass: any): Builder<T> {
        if (key !== null && key !== undefined) {
            const newSourceObject = this.sourceObject[key];
            if (newSourceObject !== null && newSourceObject !== undefined) {
                const newTargetObject = Object.create(targetClass.prototype);
                newTargetObject.build(newSourceObject);
                this.targetObject[key] = newTargetObject;
            }
        }
        return this;
    }

    public mapArray(key: string, targetClass: any): Builder<T> {
        if (key !== null && key !== undefined) {
            const newTargetObjectArray: any[] = [];
            const newSourceObjectArray = this.sourceObject[key];
            if (newSourceObjectArray !== null && newSourceObjectArray !== undefined) {
                for (let newSourceObject of newSourceObjectArray) {
                    const newTargetObject = Object.create(targetClass.prototype);
                    newTargetObject.build(newSourceObject);
                    newTargetObjectArray.push(newTargetObject);
                }
            }
            this.targetObject[key] = newTargetObjectArray;
        }
        return this;
    }

    private populatePrimitives(sourceObject: any, targetObject: any) {
        for (let key of Object.keys(sourceObject)) {
            let value = sourceObject[key];
            if (value !== undefined && value !== null) {
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    targetObject[key] = value;
                }
            }
        }
    }

    public build(): T {
        this.populatePrimitives(this.sourceObject, this.targetObject);
        return this.targetObject as T;
    }

}

interface IPersonDTO {
    name: string;
    age: number;
    mum: IPersonDTO;
    children: IPersonDTO[];
    nameAndAge(): string;
    build(sourceObject: any): IPersonDTO;
}

class PersonDTO implements IPersonDTO {

    constructor(public name: string, public age: number, public mum: IPersonDTO, public children: IPersonDTO[]) {
    }

    public build(sourceObject: any): IPersonDTO {
        return new Builder<IPersonDTO>(sourceObject, this)
            .map('mum', PersonDTO)
            .mapArray('children', PersonDTO)
            .build();
    }

    public nameAndAge(): string {
        return this.name + ' ' + this.age;
    }

}

const mumName = 'Mum';
const mumAge = 80;
const myName = 'Bob';
const myAge = 10;
const child1Name = 'Child 1';
const child1Age = 1;

/* tslint:disable:max-func-body-length */
describe('RAM DTO', () => {

    beforeEach(async(done) => {
        done();
    });

    it('instantiates with all arg constructor', async(done) => {
        try {

            const mum = new PersonDTO(mumName, mumAge, null, null);
            const me = new PersonDTO(myName, myAge, mum, null);

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

    it('instantiates with a regular object', async(done) => {
        try {

            const me: IPersonDTO = {
                name: myName,
                age: myAge,
                mum: null,
                children: null,
                nameAndAge: function (): string {
                    return null;
                },
                build: function (sourceObject: any): IPersonDTO {
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
                ]
            };

            const me = Object.create(PersonDTO.prototype);
            me.build(meLike);

            expect(me.name).toBe(myName);
            expect(me.age).toBe(myAge);
            expect(me.mum.name).toBe(mumName);
            expect(me.mum.age).toBe(mumAge);
            expect(me.nameAndAge()).toBe(myName + ' ' + myAge);
            expect(me.children).not.toBeNull();
            expect(me.children.length).toBe(1);
            expect(me.children[0].name).toBe(child1Name);
            expect(me.children[0].age).toBe(child1Age);
            expect(me.children[0].nameAndAge()).toBe(child1Name + ' ' + child1Age);

            done();

        } catch (e) {
            fail('Because ' + e);
            done();
        }
    });

});