
module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      console.log(req.user, 'authenticated user')
      return next();
    }
    req.flash('error_msg', 'Please log in.');
    res.redirect('/users/login');
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    console.log(req.user, 'sa')
    return res.redirect('/');      
  },

  
};
