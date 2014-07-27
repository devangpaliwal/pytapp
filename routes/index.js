module.exports = function(app) {

    var obj = {
        users: require('./users')(app),
        trips: require('./trips')
    };
    return obj;


}