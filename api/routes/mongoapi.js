var express = require('express');
var router = express.Router();


var routers = function (Color) {
    /* GET mongo page. */
    router.get('/', function(req, res, next) {

        Color.find((err, colors) => {
            if (err) {
                console.log(err);
                rer.json({'status': 'Error'});
            } else {
                res.json(colors);
            }
        });
        // res.render('index', { title: silence.name });
    });

    return router;
}

module.exports = routers;
