/**
 * Created by iganbold on 2/18/17.
 */
var mongoose = require('mongoose') ,
    Schema = mongoose.Schema;

var sessionModel = Schema({
    _id : String,
    user_id: String,
    current_stage: string
});

module.exports = mongoose.model('User', userModel);