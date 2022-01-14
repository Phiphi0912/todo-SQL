const bcrypt = require('bcryptjs/dist/bcrypt')
const express = require('express')
const passport = require('passport')
const router = express.Router()
const db = require('../../models')
const Todo = db.Todo
const User = db.User

router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true,
}))

router.get('/register', (req, res, next) => {
  res.render('register')
})

router.post('/register', (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body
  const errors = []

  if (!name || !email || !password || !confirmPassword) {
    errors.push({ message: '所有欄位皆為必填' })
  }

  if (password !== confirmPassword) {
    errors.push({ message: '密碼兩者不相符' })
  }

  if (errors.length) {
    return res.render('register', { errors, name, email, password, confirmPassword })
  }

  User.findOne({ where: { email } }).then(user => {
    if (user) {
      errors.push({ message: '此信箱已經註冊！' })
      return res.render('register', {
        errors,
        name,  //這裡的name是上方req.body宣告的，並非從user中拿出，所以不需要轉成JSON
        email,
        password,
        confirmPassword
      })
    }
    return bcrypt.genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash => User.create({ name, email, password: hash }))
      .then(() => res.redirect('/'))
  })
    .catch(err => next(err))
})

router.get('/logout', (req, res) => {
  req.logOut()
  req.flash('success_msg', '已成功登出！')
  res.redirect('/users/login')
})

module.exports = router