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
        name: 'Veggie Specialty Pizza',
        desc: 'Broccoli, spinach, mushrooms, onions, peppers, and black olives with real cheese made from mozzarella and your choice of crust.',
        restaurant: 'PAPA JOHNS',
        img: 'http://www.cicis.com/media/1143/pizza_adven_zestyveggie.png',
        price: 11
    });

var chikenTikka = new Food(
    {
        _id: 110002,
        name: 'Chicken Tikka Masala',
        desc: 'Boneless chicken marinated in herbs and spices, barbecued. Cooked with cream and almonds.',
        restaurant: 'Bombay Xpress',
        img: 'http://www.seriouseats.com/images/20120529-the-food-lab-chicken-tikka-masala-18.jpg',
        price: 12.95
    }
);

var malaiKofta = new Food({

    _id: 110003,
    name: 'Malai Kofta' ,
    desc: 'Vegetable ball cooked with coconut cream sauce.' ,
    restaurant: 'Bombay Xpress',
    img: 'https://usercontent2.hubstatic.com/8082401_f1024.jpg',
    price: 11.95
});

var chickenParmigiana = new Food({

    _id: 110004 ,
    name: 'Chicken Parmigiana',
    desc: 'Breaded chicken cutlet, tomato sauce, and mozzarella. Served with your choice of spaghetti, penne or salad.' ,
    restaurant: 'Pronto Pizza',
    img: 'http://food.fnr.sndimg.com/content/dam/images/food/fullset/2011/8/4/1/GL0509_chicken-parmigiana_s4x3.jpg.rend.hgtvcom.1280.960.jpeg',
    price: 8.95
});


var shrimpYaki = new Food({

    _id: 110005,
    name: 'Shrimp Yaki',
    desc: 'Stir-fried with your choice of udon or soba noodles.',
    restaurant: 'Sakura Tokyo II',
    img: 'http://ayearatthetable.com/wp-content/uploads/2012/03/IMG_7689.jpg',
    price: 6.95
});


var salmonTempuraRoll= new Food({

    _id: 110006,
    name: 'Salmon Tempura Roll',
    desc: 'Deep fried salmon with avocado, cucumber and caviar (seaweed outside).',
    restaurant: 'Sakura Tokyo II' ,
    img: 'http://www.cusushi.com/images/menu04g.jpg',
    price: 5.50
});


var baconCheeseSteakburger = new Food({

    _id: 110007,
    name: 'Bacon Cheese Steakburger',
    desc: '5.4 oz. burger served on choice of bun.',
    restaurant: 'Burger UrWay Myrtle Ave',
    img: 'https://s-media-cache-ak0.pinimg.com/236x/f1/01/82/f1018203fa816e3d732e91dcd8c01300.jpg',
    price: 9.79
});

var santaFeVeggieQuesadilla = new Food({

    _id: 110008,
    name: 'Santa Fe Veggie Quesadilla',
    desc: 'Cheddar cheese, mozzarella cheese, tomato, green peppers, black bean and red onion. Served with sour cream and salsa in your choice of tortilla.',
    restaurant: 'Burger UrWay Myrtle Ave',
    img: 'http://cookingwithjack.com/wp-content/uploads/2015/08/spinach-cheese-quesadillapp_w689_h459.jpg' ,
    price: 6.89
});


var friedPorkDumplings = new Food({

    _id: 110009,
    name: 'Fried Pork Dumplings',
    desc: 'Eight Pieces',
    restaurant: 'Panda Delight',
    img: 'http://foodforfour.com/wp-content/uploads/2014/08/pan-fried-pork-dumplings.jpg',
    price: 5.95
});


var seafoodCombinationSpecial = new Food({

    _id: 110010,
    name: 'Seafood Combination Special',
    desc: 'Fish, crab stick, jumbo shrimp and scallops.',
    restaurant: 'Panda Delight',
    img: 'http://www.seriouseats.com/assets_c/2014/05/20140428-panfried-noodles-seafood-18-thumb-625xauto-400119.jpg',
    price: 7.25
});



pizza.save(function (err, item) {
    if (err) return console.error(err);
    console.log("pizza successful");
});

chikenTikka.save(function (err, item) {
    if (err) return console.error(err);
    console.log("chikenTikka successful");
});

malaiKofta.save(function (err, item) {
    if (err) return console.error(err);
    console.log("malaiKofta successful");
});

chickenParmigiana.save(function (err, item) {
    if (err) return console.error(err);
    console.log("chickenParmigiana successful");
});

shrimpYaki.save(function (err, item) {
    if (err) return console.error(err);
    console.log("shrimpYaki successful");
});

salmonTempuraRoll.save(function (err, item) {
    if (err) return console.error(err);
    console.log("salmonTempuraRoll successful");
});

baconCheeseSteakburger.save(function (err, item) {
    if (err) return console.error(err);
    console.log("baconCheeseSteakburger successful");
});

santaFeVeggieQuesadilla.save(function (err, item) {
    if (err) return console.error(err);
    console.log("santaFeVeggieQuesadilla successful");
});

friedPorkDumplings.save(function (err, item) {
    if (err) return console.error(err);
    console.log("friedPorkDumplings successful");
});

seafoodCombinationSpecial.save(function (err, item) {
    if (err) return console.error(err);
    console.log("seafoodCombinationSpecial successful");
});












