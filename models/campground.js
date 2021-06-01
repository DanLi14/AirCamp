const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema; //shortcut to avoid writing mongoose.Schema repeatedly.

const campgroundSchema = new Schema({
  title: String,
  images: [{ url: String, filename: String }], // from imgs uploaded to cloudinary
  price: Number,
  description: String,
  location: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
});

// This middleware is trigged by await Campground.findByIdAndDelete(id) in app.js (if you use a different method, this middleware may not work).
campgroundSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model('Campground', campgroundSchema);
