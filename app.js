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
const helmet = require('helmet');

const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const path = require('path');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

//npm connect-mongo@3.2.0
const MongoDBStore = require('connect-mongo')(session);

//npm connect-mongo@4.4.1
// const MongoStore = require('connect-mongo');

// MONGOOSE CONNECTION

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/air-camp';

mongoose.connect(dbUrl, {
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

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

//npm connect-mongo@4.4.1
// const store = MongoStore.create({
//   mongoUrl: dbUrl,
//   touchAfter: 24 * 60 * 60,
//   crypto: { secret: secret },
// });

//npm connect-mongo@3.2.0
const store = new MongoDBStore({
  url: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on('error', function (e) {
  console.log('session store error', e);
});

const sessionConfig = {
  store,
  name: 'ACSession',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true, //need to purchase a SSL certificate to ensure this operates as intended.
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //equates to 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com/',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net',
];

const styleSrcUrls = [
  'https://kit-free.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/',
  'https://cdn.jsdelivr.net',
];

const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
];

const fontSrcUrls = [];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https://res.cloudinary.com/fabien14/', 'https://images.unsplash.com/'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate(), { passReqToCallback: true }));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
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

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`connected to port: ${port}`);
});
