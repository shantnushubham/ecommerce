
module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      console.log('auth')
      return next();
    }
    req.flash('error_msg', 'Please log in.');
    res.redirect('/users/login');
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');      
  },

  isEmpty:function(obj){
 // null and undefined are "empty"
 if (obj == null) return true;

 // Assume if it has a length property with a non-zero value that that property is correct.
 if (obj.length && obj.length > 0)    return false;
 if (obj.length === 0)  return true;

 // Otherwise, does it have any properties of its own?
 // Note that this doesn't handle toString and toValue enumeration bugs in IE < 9
 for (var key in obj) {
     if (hasOwnProperty.call(obj, key)) return false;
 }

 return true;
  }
};
