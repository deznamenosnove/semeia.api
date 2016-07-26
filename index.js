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

mongoose.connect(MONGODB)

const User = require('./models/user')
const Plant = require('./models/plant')

const app = express()

const authenticate = expressJwt({
  secret: SECRET,
  credentialsRequired: false
})

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
  }), serialize, generateToken, respond)

function serialize (req, res, next) {
  User.findOne({ 'alias': req.body.username }, function (err, user) {
    if (err) {
      return next(err)
    }

    req.user = {
      id: user.id
    }
    next()
  })
}

function generateToken (req, res, next) {
  req.token = jwt.sign({
    id: req.user.id
  }, SECRET, {
    expiresIn: TOKENTIME
  })
  next()
}

function respond (req, res) {
  res.status(200).json({
    user: req.user,
    token: req.token
  })
}

require('./controllers/user')(router, authenticate)
require('./controllers/plant')(router, authenticate)

router.get('/test', authenticate, function (req, res) {
  res.status(200).json({
    hello: 'world'
  })
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

app.use('/', router)

if (!module.parent) {
  app.listen(API_PORT, function () {
    console.log('server running at port:%s', API_PORT)
  })
} else {
  module.exports = app
}
