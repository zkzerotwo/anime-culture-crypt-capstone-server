const knex = require('knex')
const app = require('../src/app');
const { makeUsersArray, makeMaliciousUser } = require('./users-fixtures')
const { makeLootboxesObject } = require('./lootboxes.fixtures');
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

    describe('GET all users', () => {
        context(`Given no users`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/users')
                    .expect(200, [])
            })
        })

        context(`Given there are users in the database`, () => {
            const testUsers = makeUsersArray()
            const testLootboxes = makeLootboxesObject()
            beforeEach('insert some users', () => {
                return db
                    .into('users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('lootboxes')
                            .insert(testLootboxes)
                    });
            })
            it('responds with 200 and all of the users', () => {
                return supertest(app)
                    .get('/api/users')
                    .expect(200, testUsers)
            })
            it('responds with 200 and all user lootboxes', () => {
                let doc;
                return db('users')
                    .first()
                    .then(_doc => {
                        doc = _doc
                        // console.log(doc, "doc check")
                        return supertest(app)
                            .get(`/api/users/${doc.id}/lootboxes`)
                            .expect(200, { lootboxes: testLootboxes });
                    })
            })
        })

        context(`Given an XSS attack user`, () => {
            const { maliciousUser, expectedUser } = makeMaliciousUser()

            beforeEach('insert malicious user', () => {
                return db
                    .into('users')
                    .insert([maliciousUser])
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/users`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].title).to.eql(expectedUser.title)
                        expect(res.body[0].description).to.eql(expectedUser.description)
                    })
            })
        })

    });


    describe('GET users by id', () => {
        const users = makeUsersArray()
        beforeEach('insert some users', () => {
            return db('users').insert(users);
        })

        it('should return correct users when given an id', () => {
            let doc;
            return db('users')
                .first()
                .then(_doc => {
                    doc = _doc
                    return supertest(app)
                        .get(`/api/users/${doc.id}`)
                        .expect(200);
                })
                .then(res => {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys('id', 'user_name', 'password');
                    expect(res.body.id).to.equal(doc.id);
                    expect(res.body.user_name).to.equal(doc.user_name);
                    expect(res.body.password).to.equal(doc.password);
                });
        });

        it('should respond with a 404 when given an invalid id', () => {
            return supertest(app)
                .get('/api/users/8')
                .expect(404);
        });

    });


    describe('POST (create) new users', function () {

        //relevant
        it('should create and return a new users when provided valid data', function () {
            const newItem = {
                id: 1,
                user_name: "reiner@aot.com",
                password: "secret",
            };
            console.log(newItem, "item check")
            return supertest(app)
                .post('/api/users')
                .send(newItem)
                .expect(201)
                .expect(res => {
                    // console.log(res, "response check")
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys('user_name', 'id');
                    expect(res.body.user_name).to.equal(newItem.user_name);
                    // expect(res.body.password).to.be.undefined;
                    // expect(res.headers.location).to.equal(`/api/users/${res.body.id}`)
                });
        });

    });


    describe('PATCH (update) users by id', () => {
        context(`Given no users`, () => {
            it(`responds with 404`, () => {
                const userId = 123456
                return supertest(app)
                    .patch(`/api/users/${userId}`)
                    .expect(404, { error: { message: `User doesn't exist.` } })
            })
        })
        context('Given there are users in the database', () => {
            const testUsers = makeUsersArray()

            beforeEach('insert some users', () => {
                return db
                    ('users')
                    .insert(testUsers);
            })

            //relevant
        })
    });

    describe('DELETE a users by id', () => {
const testUsers = makeUsersArray()
        beforeEach('insert some users', () => {
            return db('users').insert(testUsers);
        })

        //relevant
        it('should delete an item by id', () => {
            return db('users')
                .first()
                .then(doc => {
                    return supertest(app)
                        .delete(`/api/users/${doc.id}`)
                        .expect(204);
                })
        });

        it('should respond with a 404 for an invalid id', function () {
            return supertest(app)
                .delete('/api/users/3')
                .expect(404);
        });
    });
});



