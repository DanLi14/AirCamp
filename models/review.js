const mongoose = require('mongoose');
const Schema = mongoose.Schema; //shortcut to avoid writing mongoose.Schema repeatedly.

const reviewSchema = new Schema({
  body: String,
  rating: Number
});

module.exports = mongoose.model("Review", reviewSchema)

