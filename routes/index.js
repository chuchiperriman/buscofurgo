var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'BuscoFurgo.com'
    });
});

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var S = require('string');
var app = express();

module.exports = router;
