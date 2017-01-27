var express = require('express');
var router = express.Router();
var fs = require('fs');
var app = express();
var ma = require('./webs/ma');
var cnet = require('./webs/cnet');
var utils = require('./utils');
var async = require('async');

var config = {
    online: true,
    data_path: utils.getUserHome(),
    providers: [
        ma,
        cnet
    ]
};

router.get('/', function(req, res) {

    var jsonFile = config.data_path + '/.buscofurgo_data.json';

    if (config.online){
        var search = function(provider, callback){
            provider.search(function(json){
                callback(null, json.results);
            });
        }
        async.map(config.providers, search, function(err, resultArrays) {
            var json = {
                results: [].concat.apply([], resultArrays)
            };
            // Cuando han terminado todos:
            if (!err){
                fs.writeFile(jsonFile, JSON.stringify(json), function (err) {
                    if (err) return console.log(err);
                    console.log('Total data stored');
                });
            }else{
                console.error("Error en la llamada a los buscadores");
                console.error(err);
            }
            console.log("Fin de todo, respondemos la web");
            res.json(json);
        });
    }else{
        res.set('Content-Type', 'application/json');
        res.send(fs.readFileSync(jsonFile, 'UTF-8'));
    }
});

module.exports = router;
