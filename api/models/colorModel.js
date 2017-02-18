var mongoose = require('mongoose') ,
    Schema = mongoose.Schema;

var colorModel = Schema({
    title: String
});

module.exports = mongoose.model('Color', colorModel);