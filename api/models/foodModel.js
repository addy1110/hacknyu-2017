/**
 * Created by ADDY on 18/02/17.
 */

var mongoose = require('mongoose') ,
    Schema = mongoose.Schema;

var foodModel = Schema({
    _id: Number,
    name: String,
    desc: String,
    restaurant: String,
    img: String,
    price: Number
});
module.exports = mongoose.model('Food', foodModel);

var pizza = new Food(
    {
        _id: 11001,
        name: 'Pepperoni',
        desc: 'Premium pepperoni, real cheese made from mozzarella and your choice of crust.',
        restaurant: 'PAPA JOHNS',
        img: 'https://www.papajohns.com/static-assets/a/images/web/product/pizzas/std_double_pep-compressed.jpg',
        price: 11
    });

var chikenTikka = new Food(
    {
        _id: 110002,
        name: 'Chicken Tikka Masala',
        desc: 'Boneless chicken marinated in herbs and spices, barbecued. Cooked with cream and almonds.'
        restaurant: 'Bombay Xpress',
        img: 'http://www.seriouseats.com/images/20120529-the-food-lab-chicken-tikka-masala-18.jpg',
        price: 12.95
    }
);

var malaiKofta = new Food({

    _id: 110003,
    name: ,
    desc: 'Vegetable ball cooked with coconut cream sauce.' ,
    restaurant:,
    img: ,
    price:
});

var  = new Food({

    _id: ,
    name: ,
    desc: ,
    restaurant:,
    img: ,
    price:
});


var  = new Food({

    _id: ,
    name: ,
    desc: ,
    restaurant:,
    img: ,
    price:
});


var  = new Food({

    _id: ,
    name: ,
    desc: ,
    restaurant:,
    img: ,
    price:
});


var  = new Food({

    _id: ,
    name: ,
    desc: ,
    restaurant:,
    img: ,
    price:
});

var  = new Food({

    _id: ,
    name: ,
    desc: ,
    restaurant:,
    img: ,
    price:
});


var  = new Food({

    _id: ,
    name: ,
    desc: ,
    restaurant:,
    img: ,
    price:
});


var  = new Food({

    _id: ,
    name: ,
    desc: ,
    restaurant:,
    img: ,
    price:
});



pizza.save(function (err, pizza) {
    if (err) return console.error(err);
    console.log("successful");
});


