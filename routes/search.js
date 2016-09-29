var express = require('express');
var router = express.Router();

var fs = require('fs');
var iconv = require('iconv-lite');
var request = require('request');
var cheerio = require('cheerio');
var S = require('string');
var app = express();

router.get('/', function(req, res) {

    var getX11Prop = function($el, prop){
        return $el.find("." + prop).contents().first().text();
    };

    url = 'http://www.milanuncios.com/anuncios-en-cantabria/t5-multivan.htm?desde=3000';

    request({
        uri: url,
        encoding: null
    }, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(iconv.decode(html, 'iso-8859-15').toString('utf-8'));
            var json = {
                results: []
            };
            $("div.x1").each(function(i, elem) {
                var data = $(this);
                var props = data.find(".x11");
                var header = data.find(".x4").text();
                var $body = data.find(".x7");
                if (!$body.length){
                    $body = data.find(".x9");
                }
                var $title = $body.find("a.cti");
                var text = $body.find(".tx").text();
                //console.log(text);
                json.results.push({
                    title: $title.text(),
                    link: "http://www.milanuncios.com" + $title.attr('href'),
                    description: text,
                    // TODO Quitamos el símbolo del Euro de momento, sale mal
                    price: getX11Prop(props, 'pr').slice(0, -1),
                    year: getX11Prop(props, "ano"),
                    mileage: getX11Prop(props, "kms"),
                    cv: getX11Prop(props, "cv"),
                    professional: data.find(".vem.pro").length > 0,
                    automatic: data.find(".cauto").length > 0,
                    province: S(header).between('(', ')').s.trim() ,
                    location: S(header).contains(' en ') ? S(header).between(' en ', '(').s : ''
                });
            });
        }

        // To write to the system we will use the built in 'fs' library.
        // In this example we will pass 3 parameters to the writeFile function
        // Parameter 1 :  output.json - this is what the created filename will be called
        // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
        // Parameter 3 :  callback function - a callback function to let us know the status of our function

        /*
        fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err) {

            console.log('File successfully written! - Check your project directory for the output.json file');

        })
        */
        //console.log(JSON.stringify(json, null, 4));

        //res.send('Check your console! <br/>' + JSON.stringify(json, null, 4));
        res.json(json);

    })

});

module.exports = router;
