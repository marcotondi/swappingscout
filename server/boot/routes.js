(function () {
    'use strict';

    var swapping = require('../swapping');
    var { OK } = require('http-status-codes');

    module.exports = function (app) {

        app.get('/init/swap', function (req, res) {

            swapping.init()
                .then(function (resolve) {
                    res.status(OK)
                        .send(resolve);
                })

        });
    };

})();