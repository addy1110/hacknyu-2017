/**
 * Created by Parteek Khushdil on 18-02-2017.
 */

var mongoose = require('mongoose') ,
    Schema = mongoose.Schema;

var orderModel = Schema({
    _id: String,
    userId: String,
    foodId: String,
    qty: Number,
    total: Number

});

module.exports = mongoose.model('Order', orderModel);