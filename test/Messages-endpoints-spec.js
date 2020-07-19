const app = require('../app');
const knex = require('knex');
const { TEST_DATABASE_URL } = require('../config');
const { makeMessagesArray } = require('./Messages-fixtures');
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

describe('Messages endpoints', () => {
    describe('GET /api/rooms/:room_id/messages', () => {
        context('given no messages in db', () => {
            it('returns empty array', () => {
                return supertest(app)
                    .get('/api/rooms/1/messages')
                    .set('Authorization', 'bearer ' + token)
                    .expect(200, [])
            })
        })

        context('messages in db', () => {
            const testMessages = makeMessagesArray();
            beforeEach('insert messages', async () => {
                const testUser = await db
                    .select('*')
                    .from('users')
                    .where('user_name', 'test')
                    .first()
                const testRoom = await db
                    .insert({ name: 'testRoom' })
                    .into('rooms')
                    .returning('*')
                    .then(rows => {
                        return rows[0]
                    })

                const formattedMessages = testMessages
                    .map(message => ({ ...message, user_id: testUser.id, rooms_id: testRoom.id }))

                await db
                    .insert(formattedMessages)
                    .into('messages')
            })

            it('returns all the messages', () => {
                return supertest(app)
                    .get('/api/rooms/1/messages')
                    .set('Authorization', 'bearer ' + token)
                    .then(response => {
                        expect(response.body.length).to.equal(3)
                    })
            })

        })
    })

})