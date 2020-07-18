const MessagesService = {
    getAll(knex) {
        return knex.select('*').from('messages')
    },

    insert(knex, newMessage) {
        return knex
            .insert(newMessage)
            .into('messages')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteMessagesForRoom(knex, id) {
        return knex('messages')
            .where({ rooms_id: id })
            .delete()
    }
}

module.exports = MessagesService