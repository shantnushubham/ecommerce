// passport.use(
//   new GoogleStrategy({
//       clientID:OAuthCredentials.googleAuth.clientID,
//       clientSecret:OAuthCredentials.googleAuth.clientSecret,
//       callbackURL:OAuthCredentials.googleAuth.callbackURL
//   },(accessToken, refreshToken, profile, done)=>{
//       process.nextTick(function() {
//           User.findOne({"email": profile.emails[0].value}, function(err, founduser){
//               if (err) {
//                   return done(err);
//               } else {
//                   if (founduser) {
//                       return done(null, founduser);
//                   } else {
//                       User.findOne({ 'googleUserId' : profile.id }, function(err, user) {
//                           if (err)
//                               return done(err);
//                           if (user) {
//                               // if a user is found, log them in
//                               return done(null, user);
//                           } else {
//                               // if the user isnt in our database, create a new user
//                               var newUser = new User();
//                               // set all of the relevant information
//                               newUser.googleUserId    = profile.id;
//                               newUser.name  = profile.displayName;
//                               newUser.email = profile.emails[0].value; // pull the first email
//                               newUser.username = profile.emails[0].value;
//                               newUser.phone = 0;
//                               // save the user

//                               User.create(new User(newUser), function(err) {
//                                   if (err)
//                                       throw err;
//                                   // Email.sendSignupEmail(profile.emails[0].value, function(rspp){
//                                       console.log(rspp);
//                                       return done(null, newUser);
//                                   // });
//                               });
//                           }
//                       });
//                   }
//               }
//           });
//           // try to find the user based on their google id
//       });
//   })
// );

// passport.use(new FacebookStrategy({
//       clientID: OAuthCredentials.facebookAuth.clientID,
//       clientSecret: OAuthCredentials.facebookAuth.clientSecret,
//       callbackURL: OAuthCredentials.facebookAuth.callbackURL,
//       profileFields: ['id', 'displayName', 'email']
//   },
//   function(accessToken, refreshToken, profile, done) {
//       User.findOne({ 'facebookId' : profile.id }, function(err, user) {
//           if (err)
//               return done(err);
//           if (user) {
//               // if a user is found, log them in
//               return done(null, user);
//           } else {
//               // if the user isnt in our database, create a new user

//               var newUser = new User();
//               // set all of the relevant information
//               newUser.facebookId    = profile.id;
//               newUser.name  = profile.displayName;
//               newUser.email = profile['_json']['email']; // pull the first email
//               newUser.username = profile['_json']['email'];
//               newUser.phone = 0;
//               // save the user

//               User.create(new User(newUser), function(err) {
//                   if (err)
//                       throw err;


//                   // Email.sendSignupEmail(profile['_json']['email'], function(rspp){
//                       console.log(rspp);
//                       return done(null, newUser);
//                   // });

//               });
//           }
//       });
//   }
// ));
