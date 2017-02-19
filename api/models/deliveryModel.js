/**
 * Created by Parteek Khushdil on 18-02-2017.
 */
var mongoose = require('mongoose') ,
    Schema = mongoose.Schema;

var deliveryModel = Schema({
    id: String, //user Id
    zip: Number,
    city: String,
    state: String
});

module.exports = mongoose.model('Delivery', deliveryModel);