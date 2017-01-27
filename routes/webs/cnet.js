var fs = require('fs');
var iconv = require('iconv-lite');
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var S = require('string');
var utils = require('../utils');

function getData(html){
    //console.log(iconv.decode(html, 'iso-8859-15').toString('utf-8'));
    var $ = cheerio.load(iconv.decode(html, 'iso-8859-15').toString('utf-8'));

    console.log("Parseando cnet");

    var json = {
        adds: [],
        pages: []
    }
    var adds = [];

    $(".mt-Card .mt-Card-body").each(function(i, elem) {
        var $body = $(this);

        var veh = {
            source: 'coches.net',
            title: $body.find(".mt-CardAd-title").text(),
            link: 'http://www.coches.net' + $body.find('.mt-CardAd-link').attr('href'),
            price: utils.priceToNumber($body.find('.mt-CardAd-price strong').text()),
            cv: '',
            description: ''
        };

        var $attrs = $body.find('.mt-CardAd-attributesList');
        $attrs.find('.mt-CardAd-attribute').each(function(i, elem){
            var self = $(this);
            if (i==0){
                veh.location = self.text();
                veh.province = self.text();
            }else if (i == 1){
                //veh.location = self.text();
            }else if (i == 2){
                veh.year = self.text();
            }else if (i == 3){
                veh.mileage = self.text().replace('km', '');
            }
        });
        json.adds.push(veh);
        /*
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
        */

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
}

function requestMaData(url, queryString, json, callback){

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

function startRequestMaData(url, queryString, json, rescallback){

    console.log("Entramos 1");

    request({
        uri: url + queryString,
        encoding: null
    }, function(error, response, html) {
        if (!error) {
            var madata = getData(html);
            if (madata.adds){
                json.results = json.results.concat(madata.adds);
                console.log("Concat");
            }
            //TODO Quitar esto cuando hagamos las páginas
            rescallback(json);
            /*
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
            */
        }
        console.log("Terminamos1");
    });
    console.log("Salimos1");
};

module.exports = {
    search: function(responseCallback){

        //Página 3 http://www.coches.net/mercedes-benz/viano/segunda-mano/?pg=3&or=1&fi=Price


        var busquedas = [
            'http://www.coches.net/volkswagen/multivan/segunda-mano/',
            'http://www.coches.net/mercedes-benz/vito/segunda-mano/',
            'http://www.coches.net/mercedes-benz/viano/segunda-mano/',
        ];

        var search = function(url, callback){
            var json = {
                results: [],
                //La Primera página la damos por procesada siempre
                pages: [1]
            };
            startRequestMaData(url,
                'or=1&fi=Price',
                json,
                function(data){
                    callback(null, data.results);
                });
        }

        async.map(busquedas, search, function(err, resultArrays) {
            responseCallback({
                results: [].concat.apply([], resultArrays)
            });
        });

    }
};
