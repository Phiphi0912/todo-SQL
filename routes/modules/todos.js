const express = require('express')
const router = express.Router()
const db = require('../../models')
const Todo = db.Todo
const User = db.User

router.get('/new', (req, res) => {
  res.render('new')
})

router.post('/', (req, res, next) => {
  const UserId = req.user.id
  const name = req.body.name
  return Todo.create({ name, UserId })
    .then(() => res.redirect('/'))
    .catch(err => next(err))
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  const UserId = req.user.id
  return Todo.findOne({
    where: { id, UserId }
  })
    .then(todo => res.render('detail', { todo: todo.toJSON() }))
    .catch(err => res.status(402).json(err))
})

router.get('/:id/edit', (req, res, next) => {
  const id = req.params.id
  const UserId = req.user.id
  Todo.findOne({
    where: { id, UserId }
  })
    .then(todo => res.render('edit', { todo: todo.toJSON() }))
    .catch(err => next(err))
})

router.put('/:id', (req, res, next) => {
  const id = req.params.id
  const UserId = req.user.id
  const { name, isDone } = req.body
  return Todo.findOne({ where: { id, UserId } })
    .then(todo => {
      todo.name = name
      todo.isDone = isDone === "on"
      return todo.save()
    })
    .then(() => res.redirect(`/todos/${id}`))
    .catch(err => next(err))
})

router.delete('/:id', (req, res) => {
  const id = req.params.id
  const UserId = req.user.id
  return Todo.destroy({ where: { id, UserId } })
    .then(() => res.redirect('/'))
})

module.exports = router