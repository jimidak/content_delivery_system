const assert = require('assert');
const path = require('path');
const fs = require('fs');
const DatabaseInit = require('../../datastore/db-init');
const Database = require('../../datastore/db');

const dbPath = path.join(__dirname, '../data/test.db');

function safeRemoveFile(path) {
    return new Promise(resolve => {
        if (! fs.existsSync(path)) {
            resolve();
        }
        fs.unlink(path, () => resolve());
    });
}

describe('DataStore database', () => {
    beforeEach((done) => {
        safeRemoveFile(dbPath).then(() => {
            new DatabaseInit({datastoreLocation: dbPath}).then(() => done());
        });
    });

    afterEach((done) => {
        safeRemoveFile(dbPath).then(() => done());
    });

    it('should return `undefined` when no data exists', (done) => {
        const db = new Database({whoami: 'test', datastoreLocation: dbPath});

        db.getOne('meta', 'name').then(actual => {

            const expected = {
                value: undefined,
                type: 'meta',
                key: 'name'
            };

            assert.deepEqual(actual, expected);
            done();
        }).catch(e => done(new Error(e)));
    });

    it('should be able to insert a meta record', (done) => {
        const db = new Database({whoami: 'test', datastoreLocation: dbPath});

        db.setOne('meta', 'name', 'MrTest').then(() => {
            db.getOne('meta', 'name').then(actual => {
                const expected = {
                    type: 'meta',
                    key: 'name',
                    value: 'MrTest'
                };
                assert.deepEqual(actual, expected);
                done();
            });
        });
    });

    it('should be able to insert multiple records', (done) => {
        const db = new Database({whoami: 'test', datastoreLocation: dbPath});

        db.setMany('meta', {name: 'foo', age: 'bar'}).then(() => {
            Promise.all([db.getOne('meta', 'name'), db.getOne('meta', 'age')]).then(actual => {
                const expected = [
                    { type: 'meta', key: 'name', value: 'foo' },
                    { type: 'meta', key: 'age', value: 'bar' }
                ];

                assert.deepEqual(actual, expected);
                done();
            }).catch(e => done(new Error(e)));
        });
    });

    it('should throw an exception when an unexpected type is used', (done) => {
        const db = new Database({whoami: 'test', datastoreLocation: dbPath});

        db.getOne('foo', 'bar').catch(e => {
            assert.equal(e, 'type must be meta, media, tracks');
            done();
        });
    });
});
