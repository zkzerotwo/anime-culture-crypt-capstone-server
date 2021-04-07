const knex = require('knex')
const app = require('../src/app');
const { makeUsersArray } = require('./users.fixtures')
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

            it('responds with 200 and all user lootboxes', () => {
                let doc;
                return db('users')
                    .first()
                    .then(_doc => {
                        doc = _doc
                        console.log(doc, "doc check")
                        return supertest(app)
                            .get(`/api/users/${doc.id}/lootboxes`)
                            .expect(200,{ lootboxes: testLootboxes});
                    })
            })

            //relevant
            it('should respond to GET `/api/users` with an array of users and status 200', function () {
                return supertest(app)
                    .get('/api/users')
                    .expect(200, testUsers)
                // .expect(res => {
                //     expect(res.body).to.be.a('array');
                //     expect(res.body).to.have.length(users.length);
                //     res.body.forEach((item) => {
                //         expect(item).to.be.a('object');
                //         expect(item).to.include.keys('id', 'user_name', 'password');
                //     });
                // });
            });

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
                        console.log(res, "response check")
                        expect(res.body).to.be.a('object');
                        expect(res.body).to.include.keys('user_name', 'id');
                        expect(res.body.user_name).to.equal(newItem.user_name);
                        // expect(res.body.password).to.be.undefined;
                        // expect(res.headers.location).to.equal(`/api/users/${res.body.id}`)
                    });
            });

            it('should respond with 400 status when given bad data', function () {
                const badItem = {
                    foobar: 'broken item'
                };
                return supertest(app)
                    .post('/api/users')
                    .send(badItem)
                    .expect(400);
            });

        });


        describe('PATCH (update) users by id', () => {
            const testUsers = makeUsersArray()

            beforeEach('insert some users', () => {
                return db('users').insert(testUsers);
            })

            //relevant
                it('should update item when given valid data and an id', function () {
                    const idToUpdate = 2
                    const updateUser = {
                        user_name: "bojangles",
                        password: "secret"
                    };
                    const expectedUser = {
                        ...testUsers[idToUpdate - 1],
                        ...updateUser
                    }
                    return supertest(app)
                        .patch(`/api/users/${idToUpdate}`)
                        .send(item)
                        .expect(200);
                })
                    // .then(res => {
                    //     console.log(res.body, "second res check")
                    //     expect(res.body).to.be.a('object');
                    //     expect(res.body).to.include.keys('id', 'user_name', 'password');
                    //     expect(res.body.user_name).to.equal(item.user_name);
                    //     expect(res.body.password).to.be.true;
                    // });
            });

            it('should respond with 400 status when given bad data', function () {
                const badItem = {
                    id: 69696969696
                };

                return db('users')
                    .first()
                    .then(doc => {
                        return supertest(app)
                            .patch(`/api/users/${doc.id}`)
                            .send(badItem)
                            .expect(400);
                    })
            });

            it('should respond with a 404 for an invalid id', () => {
                const item = {
                    'user_name': 'Buy New Dishes'
                };
                return supertest(app)
                    .patch('/api/users/aaaaaaaaaaaaaaaaaaaaaaaa')
                    .send(item)
                    .expect(404);
            });

        });


        describe('DELETE a users by id', () => {

            beforeEach('insert some users', () => {
                return db('users').insert(users);
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
                    .delete('/api/users/aaaaaaaaaaaaaaaaaaaaaaaa')
                    .expect(404);
            });
        });
    });
// });