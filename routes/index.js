module.exports = function(app,passport) {

    var obj = {
        users: require('./users')(app),
        trips: require('./trips')(app),
        pytauth:require('./pytauth')(app,passport)
    };
    return obj;


}