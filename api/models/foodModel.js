/**
 * Created by ADDY on 18/02/17.
 */
var mongoose = require('mongoose') ,
    Schema = mongoose.Schema;

var foodModel = Schema({
    _id: Number, // food Id
    name: String,
    desc: String,  // Description
    restaurant: String,
    img: String,
    price: Number
});

module.exports = mongoose.model('Food', foodModel);













