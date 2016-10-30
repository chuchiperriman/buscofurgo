var express = require('express');
var router = express.Router();
var fs = require('fs');
var app = express();
var ma = require('./webs/ma');

var config = {
    online: true,
    data_path: '/home/perriman/temp'
};

router.get('/', function(req, res) {

    var json = {
        results: [],
        //La Primera página la damos por procesada siempre
        pages: [1]
    };

    var jsonFile = config.data_path + '/ma_data.json';

    if (config.online){
        ma.search(function(json){
            console.log('Respondemos');
            fs.writeFile(jsonFile, JSON.stringify(json), function (err) {
                if (err) return console.log(err);
                console.log('MA data stored');
            });
            res.json(json);
        });
    }else{
        res.set('Content-Type', 'application/json');
        res.send(fs.readFileSync(jsonFile, 'UTF-8'));
    }
});

module.exports = router;
