const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');
const passport = require('passport');

router.route('/register').get(users.renderRegister).post(catchAsync(users.register));

// passport.authenticate is a built in middleware with passport - see docs for details.
// local can be replaced with other authentication strategies e.g. google, facebook etc.

router
  .route('/login')
  .get(users.renderLogin)
  .post(
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/login',
    }),
    users.login
  );

router.get('/logout', users.logout);

module.exports = router;
