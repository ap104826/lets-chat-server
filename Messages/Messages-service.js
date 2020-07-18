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
    }
}

module.exports = MessagesService