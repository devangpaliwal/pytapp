var md5 = require('MD5');
module.exports = function(app) {
    var bookshelf = app.get('bookshelf');


    var Users = bookshelf.Model.extend({
        tableName: 'users'
    });


    return {
        list: function(req, res) {
            var users = new Users()
                .fetchAll()
                .then(function(users) {
                    console.log(users.toJSON());
                    res.render('users/list', {
                        'records': users.toJSON()
                    })
                }).
            catch (function(error) {
                console.log(error);
                res.render('users/list', {});
            });
        },
        create: function(req, res) {
            res.render('users/create', {});
        },
        update: function(req, res) {
            var id = req.params.id;
            new Users({
                id: id
            }).fetch().then(function(model) {
                console.log(model);
                res.render('users/update', {
                    user: model.attributes
                });
            });
        },
        delete: function(req, res) {
            var id = req.params.id;
            new Users({
                id: id
            }).fetch().then(function(model) {
                model.destroy();
                res.redirect('/users/list');
            });
            //res.render('users/list', {});
        },
        save: function(req, res) {
            var password = md5(req.body.password);
            console.log(password);

            if (req.params.id) {
                new Users({
                    id: req.params.id
                }).fetch().then(function(model) {

                    model.set('firstname', req.body.firstname);
                    model.set('lastname', req.body.lastname);
                    model.set('username', req.body.username);
                    if(req.body.password){
                        model.set('password', password);    
                    }
                    model.set('phonenumber', req.body.phonenumber);
                    model.set('email', req.body.email);

                    model.save().then(function(m) {
                        res.redirect('/users/list');
                    });
                });
            } else {
                var user = new Users({
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    password: password,
                    username: req.body.username,
                    phonenumber: req.body.phonenumber,
                    email: req.body.email
                });
                user.save().then(function(savedUser) {
                    res.redirect('/users/list');
                }).
                catch (function(error) {
                    console.log(error);
                })
            }
        }
    }
}