const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const usePassport = require('./config/passport')

const routes = require('./routes/index')

const app = express()
const PORT = 3000

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(session({
  secret: 'ThisIsSecret',
  resave: false,
  saveUninitialized: true,
}))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
usePassport(app)

app.use(routes)

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  res.render('error', { statusCode, message: '請稍候在試' })
})

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})