const knex = require('knex')
const app = require('../src/app');
const { makeDropsArray, makeMaliciousDrop } = require('./drops-fixtures')
const { makeDropsArray } = require('./drops-fixtures');
const { makeUsersArray } = require('./users-fixtures')
const supertest = require('supertest');

describe('Drops endpoints.:', function () {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    });

    // before('cleanup', () => db.raw('TRUNCATE TABLE drops RESTART IDENTITY CASCADE;'));

    before('cleanup', () => db.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE;'));

    // afterEach('cleanup', () => db.raw('TRUNCATE TABLE drops RESTART IDENTITY CASCADE;'));

    afterEach('cleanup', () => db.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE;'));


    after('disconnect from the database', () => db.destroy());

    describe('GET all drops', () => {
        context(`Given no drops`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/drops')
                    .expect(200, [])
            })
        })

        context(`Given there are drops in the database`, () => {
            const testUsers = makeUsersArray()
            const testDrops = makeDropsArray()
            const testDrops = makeDropsArray()
            beforeEach('insert some users, drops, drops', () => {
                return db
                    .into('users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('drops')
                            .insert(testDrops)
                        // .then(() => {
                        //     return db
                        //         .into('drops')
                        //         .insert(testDrops)
                        // })
                    });
            })
            it('responds with 200 and all of the drops', () => {
                return supertest(app)
                    .get('/api/drops')
                    .expect(200, testDrops)
            })
            it('responds with 200 and all lotbox drops', () => {
                // before('insert drops', () => {
                return db
                    .into('drops')
                    .insert(testDrops)
                    .then(() => {
                        let doc;
                        return db('drops')
                            .first()
                            .then(_doc => {
                                doc = _doc
                                console.log(doc, "doc check")
                                // console.log(testDrops, "drop check")
                                return supertest(app)
                                    .get(`/api/drops/${doc.id}/saved`)
                                    .expect(200, { drops: testDrops });
                            })
                    })
                // })

            })
        })

        context(`Given an XSS attack lotbox`, () => {
            const { maliciousDrop, expectedDrop } = makeMaliciousDrop()

            before('insert malicious lotbox', () => {
                // console.log(maliciousDrop)
                return db
                    .into('drops')
                    .insert([maliciousDrop])
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/drops`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].title).to.eql(expectedDrop.drop_title)
                        expect(res.body[0].description).to.eql(expectedDrop.drop_description)
                    })
            })
        })

    });


    describe('GET drops by id', () => {
        const drops = makeDropsArray()
        beforeEach('insert some drops', () => {
            return db('drops').insert(drops);
        })

        it('should return correct drops when given an id', () => {
            let doc;
            return db('drops')
                .first()
                .then(_doc => {
                    doc = _doc
                    return supertest(app)
                        .get(`/api/drops/${doc.id}`)
                        .expect(200);
                })
                .then(res => {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys('id', 'title', 'description', 'is_public', 'box_owner');
                    expect(res.body.id).to.equal(doc.id);
                    expect(res.body.mal_id).to.equal(doc.mal_id);
                    expect(res.body.drop_name).to.equal(doc.drop_name);
                    expect(res.body.drop_type).to.equal(doc.drop_type);
                    expect(res.body.drop_description).to.equal(doc.drop_description);
                    expect(res.body.lootbox_id).to.equal(doc.lootbox_id);
                    expect(res.body.url).to.equal(doc.url);
                    expect(res.body.image_url).to.equal(doc.image_url);                });
        });

        it('should respond with a 404 when given an invalid id', () => {
            return supertest(app)
                .get('/api/drops/8')
                .expect(404);
        });

    });


    describe('POST (create) new drops', function () {
        //relevant
        it('should create and return a new drops when provided valid data', function () {
            const newItem = {
                // id: 1,
                title: "Shojo Classics",
                description: "Soft titles with a romantic plotline, beautiful characters, and a dramatic climax",
                // is_public: 0,
                box_owner: 1
            };
            console.log(newItem, "item check")
            return supertest(app)
                .post('/api/drops')
                .send(newItem)
                .expect(201)
                .expect(res => {
                    console.log(res.body
                        , "response check")
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys(
                        // 'id', 
                        'title',
                        'description',
                        // 'is_public', 
                        'box_owner');
                    // expect(res.body.id).to.equal(newItem.id);
                    expect(res.body.title).to.equal(newItem.title);
                    expect(res.body.description).to.equal(newItem.description);
                    expect(res.body.box_owner).to.equal(newItem.box_owner);
                    // expect(res.body.is_public).to.equal(newItem.is_public);
                })
                .then(res =>
                    // console.log(res.body, "response check")
                    supertest(app)
                        .get(`/api/drops/${res.body.id}`)
                        // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(res.body)
                );
        });

    });


    describe('PATCH (update) drops by id', () => {
        context(`Given no drops`, () => {
            it(`responds with 40
        4`, () => {
                const dropId = 123456
                return supertest(app)
                    .patch(`/api/drops/${dropId}`)
                    .expect(404, { error: { message: `Drop doesn't exist` } })
            })
        })
        context('Given there are drops in the database', () => {
            const testDrops = makeDropsArray()
            beforeEach('insert some drops', () => {
                return db
                    ('drops')
                    .insert(testDrops);
            })
            it('responds with 204 and updates the lootbox', () => {
                const idToUpdate = 2
                const updateDrop = {
                    title: 'updated lootbox title',
                    // url: 'https://updated-url.com',
                    description: 'updated lootbox description',
                    box_owner: 1,
                }
                const expectedDrop = {
                    ...testDrops[idToUpdate - 1],
                    ...updateDrop
                }
                return supertest(app)
                    .patch(`/api/drops/${idToUpdate}`)
                    // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(updateDrop)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/drops/${idToUpdate}`)
                            // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(expectedDrop)
                    )
            })
        })
    });

    describe('DELETE a drops by id', () => {
        const testDrops = makeDropsArray()
        beforeEach('insert some drops', () => {
            return db('drops').insert(testDrops);
        })

        //relevant
        it('should delete an item by id', () => {
            return db('drops')
                .first()
                .then(doc => {
                    return supertest(app)
                        .delete(`/api/drops/${doc.id}`)
                        .expect(204);
                })
        });

        it('should respond with a 404 for an invalid id', function () {
            return supertest(app)
                .delete('/api/drops/3')
                .expect(404);
        });
    });
});



