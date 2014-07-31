"use strict";
var flash = require('express-flash');
var express = require('express');
var path = require('path');
var app = express();
var dbConfig = require('../config/dbconfig');
var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


app.set('bookshelf', bookshelf);

console.log("Root Dir ", __dirname);


app.enable('trust proxy');
app.set('port', process.env.PORT || 3001);


app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.enable('trust proxy');
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded());
app.use( express.cookieParser());

app.use(express.methodOverride());

app.use(express.logger('dev'));
app.use(express.compress());
app.set('isAuthoring', false);

app.use(express.static(path.join(__dirname, '../public')));

//app.use('/public', express.static(__dirname + '../public'));

app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


// enable the routing
app.use(app.router);


var ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/login");
};



app.all("*",function(req, res, next) {
  if (/^\/login/g.test(req.url) || /^\/ajax/g.test(req.url)) {
    return next();
  } else if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect('/login');
  }
});

var routes = require('../routes')(app , passport);
console.log(routes);


app.get('/', routes.pytauth.login);
app.get('/users/list', routes.users.list);
app.get('/users/create', routes.users.create);
app.get('/users/update/:id', routes.users.update);
app.get('/users/delete/:id', routes.users.delete);
app.post('/users/save/:id?', routes.users.save);


app.get('/trips/list', routes.trips.list);
app.get('/trips/create', routes.trips.create);
app.post('/trips/save/:id?', routes.trips.save);
app.get('/trips/update/:id', routes.trips.update);
app.get('/trips/delete/:id', routes.trips.delete);

app.get('/login',routes.pytauth.login);
app.post('/login', routes.pytauth.loginPost);
app.get('/loginFailure', routes.pytauth.loginFailure);
app.get('/loginSuccess', routes.pytauth.loginSuccess);
app.get('/logout',routes.pytauth.logout);
app.get('/changepass',routes.pytauth.changepass);
app.post('/changepass',routes.pytauth.changepassPost);


app.post('/ajax/gettripurl',routes.pytauth.gettripurl);
app.post('/ajax/changepassajax',routes.pytauth.changepassajax);




/*

passport.serializeUser(function(user, done) {
  done(null, user);
});
 
passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
    	
  		return done(null, false);
    	// UserDetails.findOne({
		   //    'username': username, 
		   //  }, function(err, user) {
		   //    if (err) {
		   //      return done(err);
		   //    }
		 		
		   //    if (!user) {
		   //      return done(null, false);
		   //    }
		 
		   //    if (user.password != password) {
		   //      return done(null, false);
		   //    }
		 
		   //    return done(null, user);
    	// });
  });
}));

*/

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send(500, 'Something broke!');
});



var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});