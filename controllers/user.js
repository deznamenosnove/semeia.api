const User = require('./../models/user')

module.exports = function (router, requestAuth) {
  router.route('/users')
    .post(requestAuth, function (req, res) {
      var user = new User()
      user.email = req.body.email
      user.name = req.body.name
      user.alias = req.body.alias
      user.password = req.body.password

      user.save(function (err) {
        if (err) {
          res.send(err)
        } else {
          res.json({ message: 'User created!' })
        }
      })
    })
    .get(requestAuth, function (req, res) {
      User.find(function (err, users) {
        if (err) {
          res.send(err)
        } else {
          res.json(users)
        }
      })
    })

  router.route('/users/:user_id')
    .get(requestAuth, function (req, res) {
      User.findById(req.params.user_id, function (err, user) {
        if (err) {
          res.send(err)
        } else {
          res.json(user)
        }
      })
    })
    .put(requestAuth, function (req, res) {
      User.findById(req.params.user_id, function (err, user) {
        if (err) {
          res.send(err)
        } else {
          user.email = req.body.email
          user.name = req.body.name
          user.alias = req.body.alias
          user.password = req.body.password

          user.save(function (err) {
            if (err) {
              res.send(err)
            } else {
              res.json({ message: 'User updated!' })
            }
          })
        }
      })
    })
    .delete(requestAuth, function (req, res) {
      User.remove({
        _id: req.params.user_id
      }, function (err, user) {
        if (err) {
          res.send(err)
        } else {
          res.json({ message: 'User deleted!' })
        }
      })
    })

  return router
}
