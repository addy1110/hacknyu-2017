/**
 * Created by Parteek Khushdil on 18-02-2017.
 */
var mongoose = require('mongoose') ,
    Schema = mongoose.Schema;

var deliveryModel = Schema({
    id:string,
    zip:number,
    city:string,
    state:string
});

module.exports = mongoose.model('Delivery', deliveryModel);