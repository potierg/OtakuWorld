'use strict';

var express = require('express');
var app = express();
var MongoDB = require('./database/mongo');
var MangasDB = require('./database/mangasDB');
var ScansDB = require('./database/scansDB');

module.exports = app;

const timeout = require('connect-timeout'); //express v4
const mongo = new MongoDB();
const mangaDB = new MangasDB(mongo);
const scansDB = new ScansDB(mongo);

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

app.use(timeout(1200000));
app.use(haltOnTimedout);

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const { exec } = require('child_process');

function haltOnTimedout(req, res, next) {
    if (!req.timedout) next();
}

function getHeader(res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin,Content-Type, Authorization, x-id, Content-Length, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header('Content-Type', 'application/json');
    return res;
}


app.post('/getImg', (req, res) => {
    var link = req.body.link;

    exec('curl -L ' + link, (err, stdout, stderr) => {
        res = getHeader(res);
        res.header('Content-Type', 'image/jpeg');
        res.end(stdout, 'binary');
    });
});


// All users
mongo.connect(() => {
    app.get('/mangas/:count/:page', (req, res) => {
        var count = Number.parseInt(req.params.count);
        var page = Number.parseInt(req.params.page);
            mangaDB.get(count, page, function(obj, t) {
                res = getHeader(res);
                res.end(JSON.stringify({manga: obj, total: t}));
            });
    });

    app.get('/manga/:id', (req, res) => {
        var mangaId = req.params.id;
        mangaDB.connect(() => {
            mangaDB.getById(mangaId, function(obj) {
                res = getHeader(res);
                res.end(JSON.stringify(obj));        
            });
        });
    });

    app.get('/manga/search/:search/:page/:count', (req, res) => {
        var search = req.params.search;
        var count = Number.parseInt(req.params.count);
        var page = Number.parseInt(req.params.page);
        mangaDB.getByName(count, page, search, function(obj, t) {
            res = getHeader(res);
            res.end(JSON.stringify(({manga: obj, total: t})));
        });
    });

    app.get('/manga/autor/:auteur', (req, res) => {
        var auteur = req.params.auteur;
        mangaDB.connect(() => {
            mangaDB.getByAuteur(auteur, function(obj) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(obj));        
            });
        });
    });


    app.get('/manga/chapters/:id', (req, res) => {
        var scanId = req.params.id;
        scansDB.getByScanId(scanId, function(obj) {
            res = getHeader(res);
            res.end(JSON.stringify(obj));        
        });
    });

    app.get('/manga/:id/chapters/:tome/:chapter/scans', (req, res) => {
        var mangaId = req.params.id;
        var tome = req.params.tome;
        var chapter = req.params.chapter;

        scansDB.connect(() => {
            scansDB.getScanWithIdAndNumero(mangaId, tome, chapter, function(obj) {
                res = getHeader(res);
                res.end(JSON.stringify(obj));        
            });
        });
    });

    // Connected

    app.get('/downloadList', (req, res) => {
        mangaDB.connect(() => {
            mangaDB.getAllMangas(function(obj) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(obj));        
            });
        });
    });

    app.post('/downloadList', (req, res) => {
        mangaDB.connect(() => {
            mangaDB.getAllMangas(function(obj) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(obj));        
            });
        });
    });


    app.get('/library', (req, res) => {
        mangaDB.connect(() => {
            mangaDB.getAllMangas(function(obj) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(obj));        
            });
        });
    });

    app.post('/library', (req, res) => {
        mangaDB.connect(() => {
            mangaDB.getAllMangas(function(obj) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(obj));        
            });
        });
    });

    app.delete('/library', (req, res) => {
        mangaDB.connect(() => {
            mangaDB.getAllMangas(function(obj) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(obj));        
            });
        });
    });

});


// admin TODO


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);