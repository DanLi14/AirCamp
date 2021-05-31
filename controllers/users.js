const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
  res.render('users/register');
};

// TRY-CATCH FOR USER EXPERIENCE - BETTER TO FLASH AND REDIRECT TO REGISTER PAGE IF SOMETHING WENT WRONG e.g. duplicate username.

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      //keeps the user loggedin after successful registration.
      if (err) return next(err);
      req.flash('success', 'Welcome to AirCamp!');
      res.redirect('/campgrounds');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('register');
  }
};

module.exports.renderLogin = (req, res) => {
  res.render('users/login');
};

module.exports.login = (req, res) => {
  req.flash('success', 'Welcome back!');
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Logged out succesfully');
  res.redirect('/campgrounds');
};
