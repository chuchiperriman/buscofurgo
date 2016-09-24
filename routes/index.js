var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

var getX11Prop = function($el, prop){
    return $el.find("." + prop).contents().first().text();
};

router.get('/scrape', function(req, res) {

    url = 'http://www.milanuncios.com/anuncios-en-cantabria/t5-multivan.htm?desde=3000';

    request(url, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var json = {
                anuncios: []
            };
            $("div.x1").each(function(i, elem) {
                var data = $(this);
                var props = data.find(".x11");
                json.anuncios.push({
                    title: data.find(".cti").text(),
                    ano: getX11Prop(props, "ano"),
                    kms: getX11Prop(props, "kms"),
                    cv: getX11Prop(props, "cv"),
                    profesional: data.find(".vem.pro").length > 0,
                    automatico: data.find(".cauto").length > 0
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

})

module.exports = router;
