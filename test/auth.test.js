const knex = require('knex')
const app = require('../src/app');
const { userRegObject, makeMaliciousUser } = require('./users-fixtures')
const supertest = require('supertest');

describe('Users endpoints.:', function () {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    });

    before('cleanup', () => db.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE;'));

    afterEach('cleanup', () => db.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE;'));

    after('disconnect from the database', () => db.destroy());

    describe('POST user', () => {
        context(`Given no users`, () => {
            const newUser = userRegObject()
            it(`creates the user with an id`, () => {
                return supertest(app)
                    .post('/api/auth/login')
                    .send(newUser)
                    .expect(200, [])
            })
        })

        context(`Given there are users in the database`, () => {
            const testUsers = makeUsersArray()
            const newUser = userRegObject()
            beforeEach('insert some users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                    });
            })
            it('creates a user with an id', () => {
                return supertest(app)
                    .post('/api/auth/login')
                    .send(newUser)
                    .expect(200, newUser)
            })
        })
    });
});
