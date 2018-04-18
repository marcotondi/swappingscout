(function () {
    'use strict';

    var swapping = require('../swapping');
    var { OK } = require('http-status-codes');

    module.exports = function (app) {

        app.param('order', function (req, res, next, order) {
            console.log('CALLED ONLY ONCE');
            next();
          });          

        app.get('/init/swap/:order', function (req, res) {

            swapping.init(req.params.order)
                .then(function (resolve) {
                    res.status(OK)
                        .send(resolve);
                })

        });
    };

})();