module.exports = function(app) {
    var bookshelf = app.get('bookshelf');


    var Trips = bookshelf.Model.extend({
        tableName: 'trips'
    });

    return {
        list: function(req, res) {
            var trips = new Trips()
                .fetchAll()
                .then(function(trips) {
                    console.log(trips.toJSON());
                    res.render('trips/list', {
                        'records': trips.toJSON()
                    })
                }).
            catch (function(error) {
                console.log(error);
                res.render('trips/list', {});
            });
        },
        create: function(req, res) {
            res.render('trips/create', {});
        },
        update: function(req, res) {
            var id = req.params.id;
            new Trips({
                id: id
            }).fetch().then(function(model) {
                console.log(model.attributes);
                res.render('trips/update', {
                    'trip': model.attributes
                });
            });
        },
        delete: function(req, res) {
            var id = req.params.id;
            new Trips({
                id: id
            }).fetch().then(function(model) {
                model.destroy();
                res.redirect('/trips/list');
            });
            //res.render('users/list', {});
        },
        save: function(req, res) {
           var tripmodel;
            if (req.params.id) {
                new Trips({
                    id: req.params.id
                }).fetch().then(function(model) {
                	tripmodel = model;
                    model.set('tripname', req.body.tripname);
                    model.set('tripurl', req.body.tripurl);
                    model.set('user_id', req.body.user_id);
                    
                    model.set('timestamp', new Date());

                    model.save().then(function(m) {
                        res.redirect('/trips/list');
                    }).
                    catch (function(error) {
                		var message;
	                	if(error.code == "ER_NO_REFERENCED_ROW_"){
	                		message = "UserId "+req.body.user_id+" does not exist"
	                	}
						res.render('trips/update',{
							trip:tripmodel.attributes,
	                    	'message' : message
	                    });
                	});
                });
            } else {
                var trip = new Trips({
                    tripname: req.body.tripname,
                    tripurl: req.body.tripurl,
                    user_id: req.body.user_id,
                    timestamp: new Date()
                });
                trip.save().then(function(savedTrip) {
                    res.redirect('/trips/list');
                }).
                catch (function(error) {
                	var message;
                	if(error.code == "ER_NO_REFERENCED_ROW_"){
                		message = "UserId "+req.body.user_id+" does not exist"
                	}
					res.render('trips/create',{
                    	'message' : message
                    });
                })
            }
        }
    }
}