"use strict";

var express = require('express');
var path = require('path');
var app = express();
var dbConfig = require('../config/dbconfig');
var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);

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

app.use(express.methodOverride());

app.use(express.logger('dev'));
app.use(express.compress());
app.set('isAuthoring', false);

app.use(express.static(path.join(__dirname, '../public')));

//app.use('/public', express.static(__dirname + '../public'));

// enable the routing
app.use(app.router);


var routes = require('../routes')(app);
console.log(routes);

app.get('/users/list', routes.users.list);
app.get('/users/create', routes.users.create);
app.get('/users/update/:id', routes.users.update);
app.get('/users/delete/:id', routes.users.delete);
app.post('/users/save/:id?', routes.users.save);

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send(500, 'Something broke!');
});



var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});