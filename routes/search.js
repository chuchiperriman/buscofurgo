var express = require('express');
var router = express.Router();
var fs = require('fs');
var app = express();
var ma = require('./webs/ma');
var cnet = require('./webs/cnet');

var config = {
    online: false,
    data_path: '/home/perriman/temp'
};

router.get('/', function(req, res) {

    var json = {
        results: [],
        //La Primera página la damos por procesada siempre
        pages: [1]
    };

    var jsonFile = config.data_path + '/total_data.json';

    if (config.online){
        var finalJson;
        ma.search(function(json){
            finalJson = json;
            cnet.search(function(json){
                finalJson.results = finalJson.results.concat(json.results);
                fs.writeFile(jsonFile, JSON.stringify(finalJson), function (err) {
                    if (err) return console.log(err);
                    console.log('Total data stored');
                });
                res.json(finalJson);
            });
        });
    }else{
        res.set('Content-Type', 'application/json');
        res.send(fs.readFileSync(jsonFile, 'UTF-8'));
    }
});

module.exports = router;
