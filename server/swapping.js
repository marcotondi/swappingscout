(function () {
    'use strict';

    const _ = require("lodash");// Let's show where the Internation Space Station currently is.
    var app = require('./server.js');

    var users = {};//app.models.Consumer; //data.users;
    var objectSwap = [];//app.models.Objects; //data.objectSwap;

    /**
     * ricerca gli ogetti allinterno degli utenti
     * @param {*} _strObj 
     */
    function searchObj(_strObj) {
        var map = new Map();

        _.forEach(users, function (value, key) {
            let keyUser = value.name;
            let sizeUser = value.obj.length + value.countAss;

            _.forEach(value.obj, function (value, key) {
                if (value.label == _strObj && value.assign == false) {
                    value.point = value.bet / sizeUser;
                    map.set(keyUser, value);
                }
            });
        });
        return map;
    }

    /**
     * 
     * @param {*} _map 
     */
    function maxMap(_map) {
        var _max = -1;
        var _keyV = [];

        for (var [key, value] of _map.entries()) {
            if (value.point > _max) {
                _max = value.point;
                _keyV = [];
                _keyV.push(key);
            } else if (value.point == _max) {
                _keyV.push(key);
            }
        }
        console.log(_keyV + " => " + _max);

        return { max: _max, keys: _keyV };
    }

    /**
     * 
     * @param {*} strObj 
     */
    function startAlgo(_strObj) {
        var map = searchObj(_strObj);
        var vKeyMax = maxMap(map);

        if (vKeyMax.keys.length == 1)
            objAssing(map, vKeyMax.keys[0]);
        else if (vKeyMax.keys.length > 1) {

            console.log("call ricorsive method");
            do {
                var strObj_X = searchObjKey(vKeyMax.keys, _strObj);// search key - obj
                var idRem = startAlgo(strObj_X);// TODO call ricorsive method
                var bool = reviewUsersID(vKeyMax.keys, idRem);// remove key in keys
            } while (vKeyMax.keys.length > 1 && idRem != undefined);

            if (idRem == undefined)
                objAssing(map, chooseKey(vKeyMax.keys));// assig obj;
            else
                objAssing(map, vKeyMax.keys[0]);// assig obj
        }

        return;
    }

    /**
     * In caso di pareggio assegna l'oggetto a chi ne ha di meno
     * @param {*} _keys 
     */
    function chooseKey(_keys) {
        var key = '';
        var min = 1000;

        _keys.forEach(e => {
            if (users[e].countAss < min) {
                min = users[e].countAss;
                key = e;
            } else if (users[e].countAss == min) {
                key = undefined;
            }
        });

        if (key == undefined) {
            key = _keys[Math.floor((Math.random() * _keys.length) + 0)];
        }
        return key;
    }

    /**
     * ricerca il nuovo oggetto da assegnate, NON può essere l'oggetto corrente
     * @param {*} _keys 
     * @param {*} currObj 
     */
    function searchObjKey(_keys, currObj) {

        _keys.forEach(e => {
            _.forEach(users[e].obj, function (value, key) {
                if (value.assign == false && value.label != currObj) {
                    return value.label;
                }
            });
        });

        return;
    }

    /**
     * rimuovi il _idRem dall'array, se
     * @param {*} _keys 
     * @param {*} _idRem 
     */
    function reviewUsersID(_keys, _idRem) {
        var evens = _.remove(_keys, function (n) {
            return n === _idRem;
        });

        return evens.length > 1;
    }

    /**
     * ritorna l'id dell'utente a cui è stato assegnato l'ogetto
     * @param {*} _map 
     * @param {*} keyStrMax 
     */
    function objAssing(_map, keyStrMax) {
        var ret = '';
        for (var [key, value] of _map.entries()) {
            value.assign = true;
            if (key === keyStrMax) {
                users[key].countAss++;
                ret = key;

                // dataService.addObj(key, value);
            }

            _.remove(users[key].obj, function (n) {
                return n.assign == true;
            });
        }
        return ret;
    }

    /**
     * 
     * @param {*} _users 
     */
    function exportResult(_users) {
        _.forEach(_users, function (value, key) {
            let keyUser = value.name;
            let sizeUser = value.obj.length;

            // dataService.registerUser(keyUser);
            _.forEach(value.obj, function (value, key) {
                if (value.take) {
                    // dataService.setObj(keyUser, value);
                }
            });
        });
        // dataService.saveUsers();
        return;
    }

    /**
     * 
     */
    function init() {

        console.log('init swapping');
        var Consumer = app.models.Consumer;
        var Objects = app.models.Objects;

        var promise = [];

        promise.push(Consumer.find()
            .then(function (consumers) {
                //users = consumers[0];

                _.forEach(consumers, function (cons) {
                    users[cons.name] = {
                        name: cons.name,
                        obj: cons.obj,
                        assign: false,
                        point: 0, 
                        countAss: 0
                    }
                });
            }));

        promise.push(Objects.find()
            .then(function (objects) {
                //objectSwap = objects;

                _.forEach(objects, function (obj) {
                    objectSwap.push(obj.code);
                });
            }));

        Promise.all(promise).then(function () {
            console.log('start swapping');

            _.forEach(objectSwap, function (obj) {
                console.log("Start", obj);
                startAlgo(obj);
            });

            console.log('end swapping');
        });

        // dataService.saveUsers();
        //exportResult(users);

        return;
    }


    module.exports = {
        init
    }
})();