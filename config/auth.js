const localStratey = require('passport-local')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require('../models/User')
const User = mongoose.model('users')

module.exports = function (passport) {
    passport.use(new localStratey({ usernameField: 'email' }, (email, password, done) => {

        User.findOne({ email: email }).then((user) => {
            if (!user) {
                return done(null, false, { message: 'Incorrect passord' })
            }

            bcrypt.compare(password, user.password, (error, equal) => {
                if(equal) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: 'Incorrect password'})
                }
            })
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (error, user) => {
            done(error, user)
        })
    })
}

