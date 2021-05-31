const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review); //note that the method .review links to the form variables we created - review[rating | body]
  review.author = req.user._id; // associates review author with the session user._id
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'Created new review');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  // Pull operator from mongodDB - see docs for further deets.
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted review');
  res.redirect(`/campgrounds/${id}`);
};
