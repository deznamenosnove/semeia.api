const Plant = require('./../models/plant')

module.exports = function (router, requestAuth) {
  router.route('/plants')
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
      var limit = (req.query.limit) ? parseInt(req.query.limit) : 10;
      var skip = (req.query.skip) ? parseInt(req.query.skip) : 0;
      var sort = (req.query.sort) ? req.query.sort : 'name';
      
      Plant.find(function (err, plants) {
        if (err) {
          res.send(err)
        } else {
          res.json(plants)
        }
      }).sort(sort).limit(limit).skip(skip);
    })

  router.route('/plants/:plant_id')
    .get(requestAuth, function (req, res) {
      Plant.findById(req.params.plant_id, function (err, plant) {
        if (err) {
          res.send(err)
        } else {
          res.json(plant)
        }
      })
    })
    .put(requestAuth, function (req, res) {
      Plant.findById(req.params.plant_id, function (err, plant) {
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
      Plant.remove({
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
