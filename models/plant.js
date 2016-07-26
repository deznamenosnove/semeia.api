const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PlantSchema = new Schema({
  name: { type: String, required: true },
  species: { type: String, required: true, index: { unique: true } },
  nickname: { type: String, required: true }, // TODO: criar string de arrays [{ type: String}],
  size: { type: String, required: true }
})

module.exports = mongoose.model('Plant', PlantSchema)
