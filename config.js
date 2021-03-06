require('dotenv').config()

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'letschat-jwt-secret',
    PORT: process.env.PORT || 8001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : 'postgresql://dunder_mifflin@localhost/letschat',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin@localhost/letschat-test'
}