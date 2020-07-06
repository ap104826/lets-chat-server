const MessagesService = {
    // getAll(knex) {
    //     return knex.select('*').from('rooms')
    // },

    // insert(knex, newRoom) {
    //     return knex
    //         .insert(newRoom)
    //         .into('rooms')
    //         .returning('*')
    //         .then(rows => {
    //             return rows[0]
    //         })
    // },

    // getById(knex, id) {
    //     return knex
    //         .from('rooms')
    //         .select('*')
    //         .where('id', id)
    //         .first()
    // },

    // deleteRoom(knex, id) {
    //     return knex('rooms')
    //         .where({ id })
    //         .delete()
    // },

    // updateRoom(knex, id, newRoomFields) {
    //     return knex('rooms')
    //         .where({ id })
    //         .update(newRoomFields)
    // },
    deleteMessagesForRoom(knex, id) {
        return knex('messages')
            .where({ rooms_id: id })
            .delete()
    }
}

module.exports = MessagesService