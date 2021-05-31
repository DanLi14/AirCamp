const express = require('express');
const router = express.Router({ mergeParams: true }); //mergeParams is very important to allow the params.id info to be shared when setting app.use with :id e.g. '/campgrounds/:id/reviews'
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

// REVIEW ROUTES

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
