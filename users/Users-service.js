const UsersService = {
    getAll(knex) {
        return knex.select('*').from('users')
    },

    insert(knex, newUser) {
        return knex
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getByUserName(knex, userName, password) {
        return knex
            .from('users')
            .select('*')
            .where('user_name', userName)
            .first()
    },

    deleteRoom(knex, id) {
        return knex('users')
            .where({ id })
            .delete()
    },
}

module.exports = UsersService