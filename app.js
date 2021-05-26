const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //Middleware which allows you to implement a boilerplate HTML template across the ejs files.
// const Joi = require('joi'); // Middleware which helps validate devloper/post/server-side errors as oppossed to client-side errors.
const { campgroundSchema } = require('./schemas');
const { reviewSchema } = require('./schemas');

const methodOverride = require('method-override');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/air-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
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

// app.use to run on every single route.

app.use(express.urlencoded({ extended: true })); //allows post req in express via form.
app.use(methodOverride('_method'));
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);
app.use(express.static(path.join(__dirname, 'public')));

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
