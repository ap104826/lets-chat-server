const jwt = require('jsonwebtoken')
const config = require('../config')

const AuthService = {
    createJwt(subject, payload) {
        //create the token here
        const token = jwt.sign(payload, config.JWT_SECRET, {
            subject,
            algorithm: 'HS256',
        })
        return token; ``
    },
    verifyJwt(token) {
        return jwt.verify(token, config.JWT_SECRET, {
            algorithms: ['HS256'],
        })
    },
}

module.exports = AuthService