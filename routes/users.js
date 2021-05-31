const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');
const passport = require('passport');

router.get('/register', users.renderRegister);

router.post('/register', catchAsync(users.register));

router.get('/login', users.renderLogin);

// passport.authenticate is a built in middleware with passport - see docs for details.
// local can be replaced with other authentication strategies e.g. google, facebook etc.

router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
  }),
  users.login
);

router.get('/logout', users.logout);

module.exports = router;
