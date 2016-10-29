var express = require('express');
var router = express.Router();

var fs = require('fs');
var iconv = require('iconv-lite');
var request = require('request');
var cheerio = require('cheerio');
var S = require('string');
var app = express();

var getX11Prop = function($el, prop){
    return $el.find("." + prop).contents().first().text();
};

var getMaData = function(html){

    var $ = cheerio.load(iconv.decode(html, 'iso-8859-15').toString('utf-8'));

    var json = {
        adds: [],
        pages: []
    }
    var adds = [];

    $("div.aditem").each(function(i, elem) {
        var data = $(this);
        var props = data.find(".x11 .inmo-attributes");
        var header = data.find(".aditem-header").text();
        var $body = data.find(".aditem-detail-image-container, .aditem-detail");
        if (!$body.length){
            $body = data.find(".x9");
        }
        var $title = $body.find("a.aditem-detail-title");
        var text = $body.find(".tx").text();

        json.adds.push({
            title: $title.text(),
            link: "http://www.milanuncios.com" + $title.attr('href'),
            description: text,
            price: $body.find('.aditem-price').text(),
            year: getX11Prop(props, "ano").replace('año',''),
            mileage: getX11Prop(props, "kms").replace('kms',''),
            cv: getX11Prop(props, "cc").replace('cv',''),
            professional: data.find(".vem.pro").length > 0,
            automatic: data.find(".cauto").length > 0,
            province: S(header).between('(', ')').s.trim() ,
            location: S(header).contains(' en ') ? S(header).between(' en ', '(').s : ''
        });

    });

    $('div.adlist-paginator-pages .adlist-paginator-pagelink').each(function(i, elem){
        var data = $(this);
        if (!data.hasClass('adlist-paginator-pageselected')){
            json.pages.push({
                number: parseInt(data.find('a').text()),
                queryString: data.find('a').attr('href')
            });
        }
    });
    return json;
};

var startRequestMaData = function(url, queryString, json, rescallback){

    console.log("Entramos 1");

    request({
        uri: url + queryString,
        encoding: null
    }, function(error, response, html) {
        if (!error) {
            var madata = getMaData(html);
            if (madata.adds){
                json.results = json.results.concat(madata.adds);
                console.log("Concat");
            }

            var totalPages = madata.pages.length;
            var currentPages = 0;
            if (totalPages > 0){
                console.log('Procesando ' + currentPages + 2);
                var nextPageRequest = function(){
                    console.log(currentPages + ' de ' + totalPages);
                    if (++currentPages == totalPages){
                        rescallback(json);
                    }else{
                        requestMaData(url, queryString + '&pagina=' + (currentPages + 2), json, nextPageRequest);
                    }
                };
                requestMaData(url, queryString + '&pagina=2', json, nextPageRequest);
            }else{
                rescallback(json);
            }
        }
        console.log("Terminamos1");
    });
    console.log("Salimos1");
};

var requestMaData = function(url, queryString, json, callback){

    console.log("Entramos: " + queryString);

    request({
        uri: url + queryString,
        encoding: null
    }, function(error, response, html) {
        if (!error) {
            var madata = getMaData(html);
            if (madata.adds){
                json.results = json.results.concat(madata.adds);
                console.log("Concat");
            }
        }
        callback(json);
        console.log("Terminamos");
    });
    console.log("Salimos");
};

router.get('/', function(req, res) {

    var json = {
        results: [],
        //La Primera página la damos por procesada siempre
        pages: [1]
    };

    startRequestMaData('http://www.milanuncios.com/anuncios-en-cantabria/t5-multivan.htm',
        '?desde=3000&demanda=n&orden=baratos&cerca=s', json, function(){
            console.log('Respondemos');
            res.json(json);
        });
});

module.exports = router;
