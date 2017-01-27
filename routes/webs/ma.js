
"use strict";

var fs = require('fs');
var iconv = require('iconv-lite');
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var S = require('string');
var utils = require('../utils');

var getX11Prop = function($el, prop){
    return $el.find("." + prop).contents().first().text();
};

var getMaLink = function(link){
    if (link.indexOf('http') == -1){
        link = 'http://www.milanuncios.com' + link;
    }
    return link;
};

function getMaData(html){
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
            source: 'milanuncios',
            title: $title.text(),
            link: getMaLink($title.attr('href')),
            description: text,
            price: utils.priceToNumber($body.find('.aditem-price').text()),
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
}

function startRequestMaData(url, queryString, json, rescallback){

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

function requestMaData(url, queryString, json, callback){

    console.log("Entramos: " + url + queryString);

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

module.exports = {
    search: function(responseCallback){

        var busquedas = [
            'http://www.milanuncios.com/anuncios-en-cantabria/t5-multivan.htm',
            'http://www.milanuncios.com/anuncios-en-cantabria/mercedes-viano.htm',
            'http://www.milanuncios.com/anuncios-en-cantabria/mercedes-vito.htm'
        ];

        var search = function(url, callback){
            var json = {
                results: [],
                //La Primera página la damos por procesada siempre
                pages: [1]
            };
            startRequestMaData(url,
                '?desde=3000&demanda=n&orden=baratos&cerca=s',
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
