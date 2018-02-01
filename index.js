const API_PORT = process.env.PORT || 1337
const SECRET = process.env.SECRET || 'semeia.ai-api-secret'
const TOKENTIME = process.env.TOKENTIME || 120 * 60
const MONGODB = process.env.MONGODB || 'mongodb://nano:nano123@ds021915.mlab.com:21915/semeia'
const DEFAULTUSER = process.env.DEFAULTUSER || 'nano'
const DEFAULTPASSWD = process.env.DEFAULTPASSWD || 'nano123'
const DEFAULTNAME = process.env.DEFAULTNAME || 'Nano Gontarski'
const DEFAULTEMAIL = process.env.DEFAULTEMAIL || 'julinano@gmail.com'

const bodyParser = require('body-parser')
const express = require('express')
const expressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const Strategy = require('passport-local')
const mongoose = require('mongoose')
const uuid = require('node-uuid')

mongoose.connect(MONGODB)

const User = require('./models/user')
const Plant = require('./models/plant')
const Device = require('./models/device')

const app = express()

const authenticate = expressJwt({
  secret: SECRET,
  credentialsRequired: false
})

const respond = {
  auth: function (req, res) {
    res.status(200).json({
      user: req.user,
      token: req.token
    })
  },
  token: function (req, res) {
    res.status(201).json({
      token: req.token
    })
  },
  reject: function (req, res) {
    res.status(204).end()
  }
}

passport.use(new Strategy(
  function (username, password, done) {
    if (!module.parent) {
      console.log('authenticating %s:%s', username, password)
    }
    User.findOne({ 'alias': username }, function (err, user) {
      if (err) return done(err, false)
      if (!user) {
        User.find({}, function (err, users) {
          if (err) return done(err, false)
          if (users.length === 0) {
            user = new User()
            user.email = DEFAULTEMAIL
            user.name = DEFAULTNAME
            user.alias = DEFAULTUSER
            user.password = DEFAULTPASSWD

            user.save(function (err) {
              if (err) {
                return done(err, false)
              }

              console.log('default user created. user:%s passwd: %s', DEFAULTUSER, DEFAULTPASSWD)
              user.comparePassword(password, function (err, isMatch) {
                if (err) return done(err, false)
                if (isMatch) return done(null, user)
                console.error('invalid password')
                done(null, false)
              })
            })
          } else {
            console.error('cannot find user')
            return done(null, false)
          }
        })
      } else {
        user.comparePassword(password, function (err, isMatch) {
          if (err) return done(err, false)
          if (isMatch) return done(null, user)
          console.error('invalid password')
          done(null, false)
        })
      }
    })
  }
))

app.use(bodyParser.json())

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})

var router = express.Router()

router.get('/', function (req, res) {
  res.status(200).json({
    hello: 'world'
  })
})

router.post('/auth', passport.initialize(), passport.authenticate(
  'local', {
    session: false,
    scope: []
  }), serializeUser, serializeDevice, generateAccessToken, generateRefreshToken, respond.auth)

function serializeUser (req, res, next) {
  User.findOne({ 'alias': req.body.username }, function (err, user) {
    if (err) {
      console.error(err)
      return next(err)
    }

    req.user = {
      id: user.id
    }
    next()
  })
}

function serializeDevice (req, res, next) {
  if (req.query.permanent === 'true') {
    Device.findOne({
      alias: req.body.alias
    }, function (err, device) {
      if (err) {
        console.error(err)
        return next(err)
      }
      if (device === null) {
        device = new Device()
        device.alias = req.body.alias
        device.user = req.user.id

        device.save(function (err) {
          if (err) {
            console.error('erro', err)
            return next(err)
          }

          console.log('device registered: %s', req.body.alias)
          req.user.deviceId = device._id
          next()
        })
      } else {
        req.user.deviceId = device._id
        next()
      }
    })
  } else {
    next()
  }
}

function generateAccessToken (req, res, next) {
  req.token = req.token || {}
  req.token.accessToken = jwt.sign({
    id: req.user.id,
    deviceId: req.user.deviceId
  }, SECRET, {
    expiresIn: TOKENTIME
  })
  next()
}

function generateRefreshToken (req, res, next) {
  if (req.query.permanent === 'true') {
    req.token.refreshToken = req.user.deviceId.toString() + '.' + uuid.v4()
    Device.findOne({
      '_id': req.user.deviceId
    }, function (err, device) {
      if (err) {
        console.error(err)
        return next(err)
      }
      device.refreshToken = req.token.refreshToken
      device.save(function (err) {
        if (err) {
          console.error(err)
          return next(err)
        }
        next()
      })
    })
  } else {
    next()
  }
}

function validateRefreshToken (req, res, next) {
  Device.findOne({
    'refreshToken': req.body.refreshToken
  }, function (err, device) {
    if (err) {
      console.error(err)
      return next(err)
    }
    req.user = {
      id: device.user,
      deviceId: device.id
    }
    next()
  })
}

function rejectToken (req, res, next) {
  Device.remove({
    'refreshToken': req.body.refreshToken
  }, function (err) {
    if (err) {
      console.error(err)
      return next(err)
    }
    next()
  })
}

require('./controllers/users')(router, authenticate)
require('./controllers/plants')(router, authenticate)
require('./controllers/devices')(router, authenticate)

router.get('/me', authenticate, function (req, res) {
  res.status(200).json(req.user)
})

router.get('/create-plant', authenticate, function (req, res, done) {
  

  Plant.findOne({ 'species': "Ocimum Lamiaceae" }, function (err, plant) {
      if (err) return done(err, false)
      if (!plant) {
        plant = new Plant()
        plant.name = "Manjericão"
        plant.species = "Ocimum Lamiaceae"
        plant.nickname = "Manjericão"
        plant.size = "pequeno"

        plant.save(function (err) {
          if (err) {
            console.log(err)
            return done(err, false)
          }

          console.log('default plant created')
        })
      }
  })

  res.status(200).json({
    hello: 'world'
  })
})

router.post('/token', validateRefreshToken, generateAccessToken, respond.token)
router.post('/token/reject', rejectToken, respond.reject)

app.use('/', router)

if (!module.parent) {
  app.listen(API_PORT, function () {
    console.log('server running at port:%s', API_PORT)
  })
} else {
  module.exports = app
}
