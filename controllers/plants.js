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
      var limit = 20;
      var skip = 0;
      var sort = 'name';
      if(req.query.sort) sort = req.query.sort;
      
      var options = {
          "limit": limit,
          "skip": skip,
          "sort": sort
      }

      Plant.find(function (err, plants) {
        if (err) {
          res.send(err)
        } else {
          res.json(plants)
        }
      }, options);
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
