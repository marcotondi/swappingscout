(function () {
    'use strict';

    var swapping = require('../swapping');
    var { OK } = require('http-status-codes');

    module.exports = function (app) {

        app.param('order', function (req, res, next, order) {
            console.log('CALLED ONLY ONCE');
            next();
        });

        app.post('/init/swap', function (req, res) {

            swapping.init(req.body)
                .then(function (resolve) {
                    res.status(OK)
                        .send(resolve);
                })

        });
    };

})();