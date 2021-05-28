const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('users/register');
});

// TRY-CATCH FOR USER EXPERIENCE - BETTER TO FLASH AND REDIRECT TO REGISTER PAGE IF SOMETHING WENT WRONG e.g. duplicate username.
router.post(
  '/register',
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.flash('success', 'Welcome to AirCamp!');
      res.redirect('/campgrounds');
    } catch (e) {
      req.flash('error', e.message);
      res.redirect('register');
    }
  })
);

module.exports = router;
