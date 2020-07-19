const app = require('../app');
const knex = require('knex');
const { TEST_DATABASE_URL } = require('../config');
const { makeRoomsArray } = require('./Rooms-fixtures');
let db;

/*
      declare the token variable in a scope accessible
      by the entire test suite
    */
let token, userName;

before((done) => {
    db = knex({
        client: 'pg',
        connection: TEST_DATABASE_URL
    })

    app.set('db', db);

    supertest(app)
        .post('/api/users')
        .send({
            userName: 'test',
            password: 'test',
        })
        .end((err, response) => {
            token = response.body.authToken; // save the token!
            userName = response.body.userName
            console.log('token', token)
            console.log('userName', userName)
            done();
        });
});

after((done) => {
    supertest(app)
        .delete(`/api/users?userName=${userName}`)
        .set('Authorization', 'bearer ' + token)
        .end((err, response) => {
            token = response.body.authToken; // save the token!
            db.destroy()
            done();
        });
});


before('clean the table', () => db.raw('TRUNCATE messages, rooms RESTART IDENTITY CASCADE'));
afterEach('clean up', () => db.raw('TRUNCATE messages, rooms RESTART IDENTITY CASCADE'));

describe('Rooms endpoints', () => {
    describe('GET /api/rooms', () => {
        context('given no rooms in db', () => {
            it('returns empty array', () => {
                return supertest(app)
                    .get('/api/rooms')
                    .set('Authorization', 'bearer ' + token)
                    .expect(200, [])
            })
        })

        context('rooms in db', () => {
            const testrooms = makeRoomsArray();
            beforeEach('insert rooms', () => {
                return db
                    .insert(testrooms)
                    .into('rooms')
            })

            it('returns all the rooms', () => {
                return supertest(app)
                    .get('/api/rooms')
                    .set('Authorization', 'bearer ' + token)
                    .expect(200, testrooms)
            })

        })
    })

    describe('POST /api/rooms', () => {
        it('returns 200 and posted room', () => {
            const newRoom = { name: 'new name' }
            return supertest(app)
                .post('/api/rooms')
                .set('Authorization', 'bearer ' + token)
                .send(newRoom)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newRoom.name)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/rooms/${res.body.id}`)
                })
                .then(res => {
                    return supertest(app)
                        .get(`/api/rooms/${res.body.id}`)
                        .set('Authorization', 'bearer ' + token)
                        .expect(res.body)
                })
        })
    })

    describe('GET /api/rooms/room_id', () => {
        context('given no rooms in db', () => {
            it('returns an error', () => {
                const roomId = 4;
                return supertest(app)
                    .get(`/api/rooms/${roomId}`)
                    .set('Authorization', 'bearer ' + token)
                    .expect(404, { error: { message: `Room doesn't exist` } })
            })
        })
        context('given rooms in db', () => {
            const testRooms = makeRoomsArray();
            beforeEach('insert rooms', () => {
                return db
                    .insert(testRooms)
                    .into('rooms')

            })
            it('returns specified room', () => {
                const roomId = 1;
                return supertest(app)
                    .get(`/api/rooms/${roomId}`)
                    .set('Authorization', 'bearer ' + token)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(testRooms[roomId - 1])
                    })
            })
        })
    })

    describe('DELETE /api/rooms/room_id', () => {
        context('given no rooms in db', () => {
            it('returns error', () => {
                const roomId = 2;
                return supertest(app)
                    .delete(`/api/rooms/${roomId}`)
                    .set('Authorization', 'bearer ' + token)
                    .expect(404, { error: { message: `Room doesn't exist` } })
            })
        })
        context('given rooms in db', () => {
            const testrooms = makeRoomsArray();
            beforeEach('insert rooms', () => {
                return db
                    .insert(testrooms)
                    .into('rooms')
            })
            it('deletes specified room', () => {
                const roomId = 2;
                const expectedRooms = testrooms.filter(room => room.id !== roomId)
                return supertest(app)
                    .delete(`/api/rooms/${roomId}`)
                    .set('Authorization', 'bearer ' + token)
                    .expect(204)
                    .then(() => {
                        return supertest(app)
                            .get('/api/rooms')
                            .set('Authorization', 'bearer ' + token)
                            .expect(res => {
                                expect(res.body).to.eql(expectedRooms)
                            })
                    })
            })
        })
    })

})