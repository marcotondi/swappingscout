(function () {
    'use strict';

    var swapping = require('../swapping');

    module.exports = function (app) {

        app.get('/start', function (req, res) {

            swapping.init()
                .then(function (resolve) {
                    res.send(resolve);
                })

        });
    };

})();