const Plant = require('./../models/plant')

module.exports = function (router, requestAuth) {
  router.route('/plant')
    .post(requestAuth, function (req, res) {
      var plant = new Plant()
      plant.name = req.body.name
      plant.species = req.body.species
      plant.nickname = req.body.nickname
      plant.size = req.body.size

      plant.save(function (err) {
        if (err) {
          res.send(err)
        } else {
          res.json({ message: 'Plant created!' })
        }
      })
    })
    .get(requestAuth, function (req, res) {
      plant.find(function (err, plants) {
        if (err) {
          res.send(err)
        } else {
          res.json(plants)
        }
      })
    })

  router.route('/plant/:plant_id')
    .get(requestAuth, function (req, res) {
      plant.findById(req.params.plant_id, function (err, plant) {
        if (err) {
          res.send(err)
        } else {
          res.json(plant)
        }
      })
    })
    .put(requestAuth, function (req, res) {
      plant.findById(req.params.plant_id, function (err, plant) {
        if (err) {
          res.send(err)
        } else {
          plant.name = req.body.name
          plant.species = req.body.species
          plant.nickname = req.body.nickname
          plant.size = req.body.size
          
          plant.save(function (err) {
            if (err) {
              res.send(err)
            } else {
              res.json({ message: 'Plant updated!' })
            }
          })
        }
      })
    })
    .delete(requestAuth, function (req, res) {
      plant.remove({
        _id: req.params.plant_id
      }, function (err, plant) {
        if (err) {
          res.send(err)
        } else {
          res.json({ message: 'Plant deleted!' })
        }
      })
    })

  return router
}
