const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
  email: { type: String, required: true },
  alias: { type: String, required: true, index: { unique: true } },
  name: { type: String, required: true },
  password: { type: String, required: true }
})

UserSchema.pre('save', function (next) {
  var user = this
  if (!user.isModified('password')) return next()
  bcrypt.genSalt(SALT_ROUNDS, function (err, salt) {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}

module.exports = mongoose.model('User', UserSchema)
