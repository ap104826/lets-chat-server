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
            .select('*')
            .where('rooms_id', id)
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
}

module.exports = RoomsService