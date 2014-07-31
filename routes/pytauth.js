var LocalStrategy = require('passport-local').Strategy;
var md5 = require('MD5');



module.exports = function(app,passport){
	
	var bookshelf = app.get('bookshelf');


    var Users = bookshelf.Model.extend({
        tableName: 'users'
    });

    var Trips = bookshelf.Model.extend({
        tableName: 'trips'
    });

	passport.serializeUser(function(user, done) {
	  done(null, user);
	});
 
	passport.deserializeUser(function(user, done) {
	  done(null, user);
	});

	passport.use(new LocalStrategy({
		usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true

	},function(req, username, password, done) {
		
	    var foo = function(user) {
	    		if(!user){
	    			return done(null,false);
	    		}
			    var localPassword = md5(req.body.password);
			    console.log(localPassword, user.get('password'));
			    console.log(user);
			    
			    if (user.get('password') != localPassword) {
			   		return done(null, false);
			    }
			return done(null, user);
	    }

	    console.log("Username ",username);
			new Users({
			       'username': req.body.username, 
			}).fetch()
			.then(foo).catch(function(error){
	    	 		 return done(error);
			 });
	  
	}));

	return {
		'login' : function(req,res){
			res.render('auth/login');
		},
		'loginFailure' : function(req,res,next){
			req.flash('error', 'Invalid Credentials');
			res.redirect('/login')
			//res.render('auth/login');
		},
		'loginSuccess' : function(req,res,next){
			res.redirect('/users/list');
		},
		'loginPost' : passport.authenticate('local', {
			    successRedirect: '/loginSuccess',
			    failureRedirect: '/loginFailure'
		  }),
		'logout' : function(req,res,next){
			req.logout();
			res.redirect('/login');
		},
		"changepass":function(req,res,next){
			res.render('auth/changepassword');	
		},
		"changepassPost":function(req,res,next){
			
			var params = req.body;
			if(params.newpassword !== params.retypepassword){
				req.flash('error', 'Passwords do not match');
				res.render('auth/changepassword');
				return;
			}
			

			var pass = md5(params.oldpassword);
			if(pass!== req.user.password){
				req.flash('error', 'Old password does not match');
				res.render('auth/changepassword');
				return;
			}

			new Users({'username':req.user.username}).fetch().then(function(user){
				user.set('password',md5(params.newpassword));
				user.save().then(function(){
					req.flash('error', 'Password changed Successfully');
					res.render('auth/changepassword');	
				});
				return;
			}).catch(function(error){
				console.log(error);
				req.flash('error', 'Unable to change password');
				res.render('auth/changepassword');
				return;
			});
			//res.render('auth/changepassword');	
		},

		"gettripurl" : function(req,res,next){
			var username = req.body.username;
			var password = req.body.password;

			new Users({'username':username}).fetch().then(function(user){
					
				if(password!==user.get('password')){
					res.json({
						"status":"error",
						"code" : 102,
						"message" : "Password does not match"
					});
					return;
				}


				var tripQueryObj = {where:{user_id:user.get('id')}};
				if(req.body.tripid){
					tripQueryObj['andWhere'] = {id:req.body.tripid};
				}

				new Trips()
				.query(tripQueryObj)
				//.orderBy('timestamp')
				.fetchAll().then(function(trips){

					if(!trips.length){
						res.json({
							"status":'error',
							'code':'106',
							'message':"User does not have any trip"
						});
					}
					res.json({
						"status":'success',
						'url':trips.at(trips.length-1).get('tripurl')
					});
				})
				.catch(function(error){
					res.json({
						"status":'error',
						'code':'105',
						'message':"Trip does not exist"
					});
				});
			})
			.catch(function(error){
				res.json({
					"status":"error",
					"code" : 101,
					"message" : "User does not exist"
				});
			});

		},
		"changepassajax":function(req,res,next){
			
			var params = req.body;
			
			if(params.newpassword !== params.retypepassword){
				res.json({
					"status":"error",
					"code": "301",
					"message":"New password and retypepassword do not match"
				});
				return;
			}

			new Users({'username':req.body.username}).fetch().then(function(user){
				

				var pass = params.oldpassword;
				if(pass !== user.get('password')){
					res.json({
						"status":"error",
						"code": "302",
						"message":"Users password does not match"
					});
					return;
				}

				user.set('password',params.newpassword);

				user.save().then(function(){
					res.json({
						"status":"success",
						"message":"Password changed Successfully"
					});
				});
				return;
			}).catch(function(error){
				console.log(error);
				res.json({
					"status":"error",
					"code": "303",
					"message":"Unable to change password. No user found with name "+req.body.username
				});
				return;
			});
			//res.render('auth/changepassword');	
		},
		

	}
}