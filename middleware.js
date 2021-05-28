const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // store URL they are requesting.
    req.flash('error', 'You must be signed in first');
    return res.redirect('/login');
  }
  next();
};

module.exports = isLoggedIn;
