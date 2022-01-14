module.exports = {
  authenticator: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('warning_msg', '請先登入後，再繼續使用！')
    return res.redirect('/users/login')
  }
}