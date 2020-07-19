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
    getById(knex, id) {
        return knex
            .from('users')
            .select('*')
            .where('id', id)
            .first()
    },

    getByUserName(knex, userName) {
        return knex
            .from('users')
            .select('*')
            .where('user_name', userName)
            .first()
    },

    delete(knex, userName) {
        return knex
            .from('users')
            .where('user_name', userName)
            .delete()
    }
}

module.exports = UsersService