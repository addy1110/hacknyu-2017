/**
 * Created by iganbold on 2/18/17.
 */
var mongoose = require('mongoose') ,
    Schema = mongoose.Schema;

var userModel = Schema({
    _id : String
});

module.exports = mongoose.model('User', userModel);