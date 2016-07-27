const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DeviceSchema = new Schema({
  alias: { type: String, required: true },
  token: { type: String },
  user: { type: Schema.Types.ObjectId, required: true }
})

module.exports = mongoose.model('Device', DeviceSchema)
