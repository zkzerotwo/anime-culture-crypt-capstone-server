const knex = require('knex')
const app = require('../src/app');
const { makeLootboxesArray, makeMaliciousLootbox } = require('./lootboxes-fixtures')
const { makeDropsArray } = require('./drops-fixtures');
const { makeUsersArray } = require('./users-fixtures')
const supertest = require('supertest');

describe('Lootboxes endpoints.:', function () {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    });

    // before('cleanup', () => db.raw('TRUNCATE TABLE lootboxes RESTART IDENTITY CASCADE;'));

    before('cleanup', () => db.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE;'));

    // afterEach('cleanup', () => db.raw('TRUNCATE TABLE lootboxes RESTART IDENTITY CASCADE;'));

    afterEach('cleanup', () => db.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE;'));


    after('disconnect from the database', () => db.destroy());

    describe('GET all lootboxes', () => {
        context(`Given no lootboxes`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/lootboxes')
                    .expect(200, [])
            })
        })

        context(`Given there are lootboxes in the database`, () => {
            const testUsers = makeUsersArray()
            const testLootboxes = makeLootboxesArray()
            const testDrops = makeDropsArray()
            beforeEach('insert some users, drops, lootboxes', () => {
                return db
                    .into('users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('lootboxes')
                            .insert(testLootboxes)
                        // .then(() => {
                        //     return db
                        //         .into('drops')
                        //         .insert(testDrops)
                        // })
                    });
            })
            it('responds with 200 and all of the lootboxes', () => {
                return supertest(app)
                    .get('/api/lootboxes')
                    .expect(200, testLootboxes)
            })
            it('responds with 200 and all lotbox drops', () => {
                before('insert drops', () => {
                    return db
                        .into('drops')
                        .insert(testDrops)
                })
                let doc;
                return db('lootboxes')
                    .first()
                    .then(_doc => {
                        doc = _doc
                        console.log(doc, "doc check")
                        // console.log(testDrops, "drop check")
                        return supertest(app)
                            .get(`/api/lootboxes/${doc.id}/saved`)
                            .expect(200, { drops: testDrops });
                    })
            })
        })

        context(`Given an XSS attack lotbox`, () => {
            const { maliciousLootbox, expectedLootbox } = makeMaliciousLootbox()

            beforeEach('insert malicious lotbox', () => {
                return db
                    .into('lootboxes')
                    .insert([maliciousLootbox])
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/lootboxes`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].title).to.eql(expectedLootbox.title)
                        expect(res.body[0].description).to.eql(expectedLootbox.description)
                    })
            })
        })

    });


    describe('GET lootboxes by id', () => {
        const lootboxes = makeLootboxesArray()
        beforeEach('insert some lootboxes', () => {
            return db('lootboxes').insert(lootboxes);
        })

        it('should return correct lootboxes when given an id', () => {
            let doc;
            return db('lootboxes')
                .first()
                .then(_doc => {
                    doc = _doc
                    return supertest(app)
                        .get(`/api/lootboxes/${doc.id}`)
                        .expect(200);
                })
                .then(res => {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys('id', 'title', 'description', 'is_public', 'box_owner');
                    expect(res.body.id).to.equal(doc.id);
                    expect(res.body.title).to.equal(doc.title);
                    expect(res.body.description).to.equal(doc.description);
                    expect(res.body.box_owner).to.equal(doc.box_owner);
                    expect(res.body.is_public).to.equal(doc.is_public);
                });
        });

        it('should respond with a 404 when given an invalid id', () => {
            return supertest(app)
                .get('/api/lootboxes/8')
                .expect(404);
        });

    });


    describe('POST (create) new lootboxes', function () {

        //relevant
        it('should create and return a new lootboxes when provided valid data', function () {
            const newItem = {
                id: 1,
                title: "Shojo Classics",
                description: "Soft titles with a romantic plotline, beautiful characters, and a dramatic climax",
                is_public: 0,
                box_owner: 1
            };
            console.log(newItem, "item check")
            return supertest(app)
                .post('/api/lootboxes')
                .send(newItem)
                .expect(201)
                .expect(res => {
                    // console.log(res, "response check")
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.keys('id', 'title', 'description', 'is_public', 'box_owner');
                    expect(res.body.id).to.equal(newItem.id);
                    expect(res.body.title).to.equal(newItem.title);
                    expect(res.body.description).to.equal(newItem.description);
                    expect(res.body.box_owner).to.equal(newItem.box_owner);
                    expect(res.body.is_public).to.equal(newItem.is_public);
                });
        });

    });


    describe('PATCH (update) lootboxes by id', () => {
        context(`Given no lootboxes`, () => {
            it(`responds with 404`, () => {
                const lotboxId = 123456
                return supertest(app)
                    .patch(`/api/lootboxes/${lotboxId}`)
                    .expect(404, { error: { message: `Lootbox doesn't exist` } })
            })
        })
        context('Given there are lootboxes in the database', () => {
            const testLootboxes = makeLootboxesArray()

            beforeEach('insert some lootboxes', () => {
                return db
                    ('lootboxes')
                    .insert(testLootboxes);
            })

            //relevant
        })
    });

    describe('DELETE a lootboxes by id', () => {
        const testLootboxes = makeLootboxesArray()
        beforeEach('insert some lootboxes', () => {
            return db('lootboxes').insert(testLootboxes);
        })

        //relevant
        it('should delete an item by id', () => {
            return db('lootboxes')
                .first()
                .then(doc => {
                    return supertest(app)
                        .delete(`/api/lootboxes/${doc.id}`)
                        .expect(204);
                })
        });

        it('should respond with a 404 for an invalid id', function () {
            return supertest(app)
                .delete('/api/lootboxes/3')
                .expect(404);
        });
    });
});



