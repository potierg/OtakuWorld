'use strict';

var express = require('express');
var app = express();
var MangasDB = require('./database/mangasDB');
var ScansDB = require('./database/scansDB');


module.exports = app;

const timeout = require('connect-timeout'); //express v4
const mangaDB = new MangasDB();
const scansDB = new ScansDB();

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

app.use(timeout(1200000));
app.use(haltOnTimedout);

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

// All users
mangaDB.connect(() => {    
    app.get('/mangas/:count/:page', (req, res) => {
        var count = Number.parseInt(req.params.count);
        var page = Number.parseInt(req.params.page);
            mangaDB.get(count, page, function(obj) {
                res = getHeader(res);
                res.end(JSON.stringify(obj));        
            });
    });

    app.get('/manga/:id', (req, res) => {
        var mangaId = req.params.id;
        mangaDB.connect(() => {
            mangaDB.getById(mangaId, function(obj) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(obj));        
            });
        });
    });

    app.get('/manga/search/:search', (req, res) => {
        var search = req.params.search;
        mangaDB.connect(() => {
            mangaDB.getByName(search, function(obj) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(obj));        
            });
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


    app.get('/manga/:id/chapters', (req, res) => {
        var mangaId = req.params.id;
        scansDB.connect(() => {
            scansDB.getByMangaId(mangaId, function(obj) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(obj));        
            });
        });
    });

    app.get('/manga/:id/chapters/:numero/scans', (req, res) => {
        var mangaId = req.params.id;
        var numero = req.params.numero;
        scansDB.connect(() => {
            scansDB.getScanWithIdAndNumero(mangaId, numero, function(obj) {
                res.setHeader('Content-Type', 'application/json');
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