import * as mongoose from 'mongoose';

const mongoDbUrl = 'mongodb://localhost/ram-test';
console.log('\nUsing mongo: ', mongoDbUrl, '\n');

export function connectDisconnectMongo() {

    beforeEach((done) => {
        mongoose.connect(mongoDbUrl, {}, done);
    });

    afterEach((done) => {
        mongoose.disconnect(done);
    });

}

