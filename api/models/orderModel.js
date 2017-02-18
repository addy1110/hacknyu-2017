/**
 * Created by Parteek Khushdil on 18-02-2017.
 */

var mongoose = require('mongoose') ,
    Schema = mongoose.Schema;

var orderModel = Schema({
    _id:string
    userid:string,
    locationid:string,
    foodid:string,
    quantity:number

});

module.exports = mongoose.model('Order', orderModel);