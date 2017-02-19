/**
 * Created by Parteek Khushdil on 18-02-2017.
 */

var mongoose = require('mongoose') ,
    Schema = mongoose.Schema;

var orderModel = Schema({
    _id: String, // Order Id
    userId: String,
    listItems: Array,
    total: Number
});

module.exports = mongoose.model('Order', orderModel);

// foodId: String,
//     qty: Number,
//     date: String,
//     total: Number // Final Amount