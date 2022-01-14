const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, (req, email, password, done) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered!' })
        }
        return bcrypt.compare(password, user.password).then(matched => {
          if (!matched) {
            return done(null, false, { message: 'Email or Password is not correct' })
          }
          return done(null, user)
        })
      })
      .catch(err => done(err))
  }))

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK,
    profileFields: ['email', 'displayName']
  },
    (accessToken, refreshToken, profile, done) => {
      try {
        const { email, name } = profile._json
        User.findOne({ where: { email } })
          .then(async user => {
            if (user) return done(null, user)
            const randomPassword = Math.random().toString(36).slice(-8)
            const hashPassword = await bcrypt.genSalt(10).then(salt => bcrypt.hash(randomPassword, salt))
            await User.create({ name, email, password: hashPassword })
            done(null, user)
          })
      } catch (err) {
        done(err)
      }
    }))

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then(user => {
        user = user.toJSON()
        done(null, user)
      }).catch(err => done(err))
  })
}