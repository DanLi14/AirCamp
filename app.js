if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate'); //Middleware which allows you to implement a boilerplate HTML template across the ejs files.
// const Joi = require('joi'); // Middleware which helps validate devloper/post/server-side errors as oppossed to client-side errors. (moved to schemas.js)
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');

const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const path = require('path');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// MONGOOSE CONNECTION

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

// VIEWS ENGINE SET-UP

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// APP.USE CONFIG FOR ROUTES.

app.use(express.urlencoded({ extended: true })); //allows post req in express via form.
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const sessionConfig = {
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //equates to 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.session);
  console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// LINK TO ROUTES.

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

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
