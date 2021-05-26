const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //Middleware which allows you to implement a boilerplate HTML template across the ejs files.
// const Joi = require('joi'); // Middleware which helps validate devloper/post/server-side errors as oppossed to client-side errors.
const { campgroundSchema } = require('./schemas');
const { reviewSchema } = require('./schemas');

const methodOverride = require('method-override');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review');

const campgrounds = require('./routes/campgrounds');

mongoose.connect('mongodb://localhost:27017/air-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// app.use runs on every single route.

app.use(express.urlencoded({ extended: true })); //allows post req in express via form.
app.use(methodOverride('_method'));
app.use("/campgrounds", campgrounds)

//custom middleware for validation using Joi

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// HOME ROUTE

app.get('/', (req, res) => {
  res.render('home'); // first link to home ejs
});

// REVIEW ROUTES

app.post(
  '/campgrounds/:id/reviews',
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); //note that the method .review links to the form variables we created - review[rating|body]
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  '/campgrounds/:id/reviews/:reviewId',
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // Pull operator from mongodDB - see docs for further deets.
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

// app.all is for every single request and * is for all paths.
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

// err is taken from the output of the next function call which occurs when an error is detected/thrown.
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Error - something went wrong';
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('connected to port 3000');
});
