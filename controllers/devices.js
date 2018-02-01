const Device = require('./../models/device')

module.exports = function (router, requestAuth) {
  router.route('/devices')
    .post(requestAuth, function (req, res) {
      var device = new Device()
      device.alias = req.body.alias
      device.user = req.body.user

      device.save(function (err) {
        if (err) {
          res.send(err)
        } else {
          res.json({ message: 'Device created!' })
        }
      })
    })
    .get(requestAuth, function (req, res) {
      var limit = (req.query.limit) ? parseInt(req.query.limit) : 10;
      var skip = (req.query.skip) ? parseInt(req.query.skip) : 0;
      var sort = (req.query.sort) ? req.query.sort : 'name';
      
      Device.find(function (err, devices) {
        if (err) {
          res.send(err)
        } else {
          res.json(devices)
        }
      }).sort(sort).limit(limit).skip(skip);
    })

  router.route('/devices/:device_id')
    .get(requestAuth, function (req, res) {
      Device.findById(req.params.device_id, function (err, device) {
        if (err) {
          res.send(err)
        } else {
          res.json(device)
        }
      })
    })
    .put(requestAuth, function (req, res) {
      Device.findById(req.params.device_id, function (err, device) {
        if (err) {
          res.send(err)
        } else {
          device.alias = req.body.alias
          device.user = req.body.user

          device.save(function (err) {
            if (err) {
              res.send(err)
            } else {
              res.json({ message: 'Device updated!' })
            }
          })
        }
      })
    })
    .delete(requestAuth, function (req, res) {
      Device.remove({
        _id: req.params.device_id
      }, function (err, user) {
        if (err) {
          res.send(err)
        } else {
          res.json({ message: 'Device deleted!' })
        }
      })
    })

  return router
}
