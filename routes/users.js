const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/subscribe', (req, res) => {
  res.render('users/subscribe')
})

router.post('/subscribe', (req, res) => {
  var errors = []

  if (!req.body.name || typeof req.body.name === 'undefined' || req.body.name == null) {
    errors.push({ text: 'Invalid name!' })
  }

  if (!req.body.email || typeof req.body.email === 'undefined' || req.body.email == null) {
    errors.push({ text: 'Invalid password!' })
  }

  if (!req.body.password || typeof req.body.password === 'undefined' || req.body.password == null) {
    errors.push({ text: 'Invalid password!' })
  }

  if (req.body.password.length < 4) {
    errors.push({ text: 'Password too short!' })
  }

  if (req.body.password !== req.body.password2) {
    errors.push({ text: 'The passwords are different!' })
  }

  if (errors.length > 0) {
    res.render('users/subscribe', { errors: errors })
  } else {
    User.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        req.flash('error_msg', 'E-mail is already being used!')
        res.redirect('/users/subscribe')
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        })

        bcrypt.genSalt(10, (error, salt) => {
          bcrypt.hash(newUser.password, salt, (error, hash) => {
            if (error) {
              req.flash('error_msg', 'Error: User can\'t be save!')
              res.redirect('/')
              console.error(error.stack)
            }

            newUser.password = hash

            newUser.save().then(() => {
              req.flash('success_msg', 'User was created with success!')
              res.redirect('/')
            }).catch((err) => {
              req.flash('error_msg', 'Error: the user can\'t be created!')
              res.redirect('/users/subscribe')
              console.error(err.stack)
            })
          })
        })
      }
    }).catch((err) => {
      req.flash('error_msg', 'Intern error')
      res.redirect('/')
      console.error(err.stack)
    })
  }
})

router.get('/login', (req, res) => {
  res.render('users/login')
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'Logouted!')
  res.redirect('/')
})

module.exports = router
