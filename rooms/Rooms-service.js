const RoomsService = {
    getAll(knex) {
        return knex.select('*').from('rooms')
    },

    insert(knex, newRoom) {
        return knex
            .insert(newRoom)
            .into('rooms')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    //get messages for that room
    getmessagesbyroomId(knex, id) {
        return knex
            .from('messages')
            .join('users', 'users.id', '=', 'messages.user_id')
            .select('messages.*', 'users.user_name')
            .where('rooms_id', id)
            .orderBy('modified')
    },

    getById(knex, id) {
        return knex
            .from('rooms')
            .select('*')
            .where('id', id)
            .first()
    },

    deleteRoom(knex, id) {
        return knex('rooms')
            .where({ id })
            .delete()
    },

    updateRoom(knex, id, newRoomFields) {
        return knex('rooms')
            .where({ id })
            .update(newRoomFields)
    },
    joinRoom(knex, roomId, userId) {
        return knex
            .insert({ user_id: userId, room_id: roomId })
            .into('usersperroom')
    },
    leaveRoom(knex, roomId, userId) {
        return knex('usersperroom')
            .where({ user_id: userId, room_id: roomId })
            .delete()
    },
    getUsersPerRoom(knex, roomId) {
        return knex
            .from('usersperroom')
            .join('users', 'users.id', '=', 'usersperroom.user_id')
            .select('users.id', 'users.user_name')
            .where({ room_id: roomId })
    }
}

module.exports = RoomsService