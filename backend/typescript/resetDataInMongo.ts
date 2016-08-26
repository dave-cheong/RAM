import * as mongoose from 'mongoose';
import * as mongooseAutoIncrement from 'mongoose-auto-increment';

const identityCounterCollectionName = 'identitycounters';
const identityCounterModelName = 'IdentityCounter';

/* tslint:disable:max-func-body-length */
export const doResetDataInMongo = (done?: () => void) => {

    mongooseAutoIncrement.initialize(mongoose.connection);

    return new Promise<void>(function (mainResolve, mainReject) {

        mongoose.connection.db.listCollections(undefined).toArray((err: Error, collectionNames: [{name: string}]) => {

            // drop all collections
            // reset identity counter
            const promises = collectionNames.map(function (collectionName) {
                return new Promise<string>(function (resolve, reject) {
                    try {
                        const name = collectionName.name;
                        if (name.indexOf('.') === -1) {
                            // excluded system collections (like system.indexes)
                            if (name.toLowerCase() !== identityCounterCollectionName) {
                                mongoose.connection.db.dropCollection(name, (err: Error) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(name);
                                    }
                                });
                            } else {
                                mongoose.model(identityCounterModelName).update(
                                    {count: 1},
                                    (err: Error, raw: Object) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(name);
                                        }
                                    }
                                );
                            }
                        } else {
                            resolve(name);
                        }
                    } catch (e) {
                        console.log('\nUnable to drop collection:', e);
                        reject(e);
                    }
                });
            });

            // return promises or invoke done callback
            // console.log('Resolving promises: ' + promises.length);

            let result = Promise.resolve('');
            promises.forEach((promise: Promise<string>) => {
                result = result
                    .then(async () => {
                        return await promise;
                    })
                    .catch((err: Error) => {
                        console.log('\nUnable to drop mongo:', err);
                        mainReject();
                        if (done) {
                            done();
                        }
                    });
            });

            result.then(() => {
                mainResolve();
                if (done) {
                    done();
                }
            });

            // Promise.all(promises)
            //     .then(() => {
            //         // console.log('Dropped database');
            //         mainResolve();
            //         if (done) {
            //             done();
            //         }
            //     })
            //     .catch((err: Error) => {
            //         console.log('\nUnable to drop mongo:', err);
            //         mainReject();
            //         if (done) {
            //             done();
            //         }
            //     });

        });

    });

};
