var express = require('express');
var router = express.Router();
var fs = require('fs');
var app = express();
var ma = require('./webs/ma');
var cnet = require('./webs/cnet');

var config = {
    online: true,
    data_path: '/home/perriman/temp',
    providers: [
        ma,
        cnet
    ]
};

router.get('/', function(req, res) {

    var json = {
        results: [],
        //La Primera página la damos por procesada siempre
        pages: [1]
    };

    var jsonFile = config.data_path + '/total_data.json';

    if (config.online){
        var finalJson = {
            results: []
        };

        var num = 0;
        var resProvider = function(json){
            finalJson.results = finalJson.results.concat(json.results);
            if (++num < config.providers.length){
                config.providers[num].search(resProvider);
            }else{
                fs.writeFile(jsonFile, JSON.stringify(finalJson), function (err) {
                    if (err) return console.log(err);
                    console.log('Total data stored');
                });
                res.json(finalJson);
            }
        };
        config.providers[num].search(resProvider);
    }else{
        res.set('Content-Type', 'application/json');
        res.send(fs.readFileSync(jsonFile, 'UTF-8'));
    }
});

module.exports = router;
