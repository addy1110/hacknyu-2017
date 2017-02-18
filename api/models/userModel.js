/**
 * Created by iganbold on 2/18/17.
 */
var mongoose = require('mongoose') ,
    Schema = mongoose.Schema;

var userModel = Schema({
    _id : String,
    session: {
        _id: String,
        current_stage: String
    }
});

module.exports = mongoose.model('User', userModel);