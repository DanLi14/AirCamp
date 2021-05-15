const mongoose = require('mongoose');
const Schema = mongoose.Schema; //shortcut to avoid writing mongoose.Schema repeatedly.

const campgroundSchema = new Schema({
  title: String,
  price: String,
  description: String,
  location: String,
});

module.exports = mongoose.model('Campground', campgroundSchema);

