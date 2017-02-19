/**
 * Created by Parteek Khushdil on 18-02-2017.
 */

var mongoose = require('mongoose') ,
    Schema = mongoose.Schema;

var orderModel = Schema({
    _id: String, // Order Id
    userId: String,
    foodId: String,
    qty: Number,
    date: String,
    total: Number // Final Amount

});

module.exports = mongoose.model('Order', orderModel);