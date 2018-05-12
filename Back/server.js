'use strict';

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const express = require('express');
const app = express();
module.exports = app;

const header = require("./src/header");
const Mongo = require("./mongo");

const MangaModel = require('./database/mangasDB.js');
const ScanModel = require('./database/scansDB.js');
const DownloadModel = require("./database/downloadDB");

var mongo = new Mongo();

init();

var mangaModel = new MangaModel(mongo);
var scanModel = new ScanModel(mongo);
var downloadModel = new DownloadModel(mongo);

const timeout = require('connect-timeout'); //express v4

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

/*
// get Image
app.post('/getImg', (req, res) => {
    var link = req.body.link;

    exec('curl -L ' + link, (err, stdout, stderr) => {
        res = getHeader(res);
        res.header('Content-Type', 'image/jpeg');
        res.end(stdout, 'binary');
    });
});
*/

// For all users
app.get('/mangas/:count/:page', (req, res) => {
    res = getHeader(res);
    var count = Number.parseInt(req.params.count);
    var page = Number.parseInt(req.params.page);
    
    mangaModel.get(count, page, function (mangasObj) {
        res.end(JSON.stringify(mangasObj));    
    });
});

app.get('/manga/:id', (req, res) => {
    res = getHeader(res);
    var mangaId = req.params.id;

    mangaModel.getById(mangaId, function (manga) {
        res.end(JSON.stringify(manga));
    });
});

app.get('/manga/search/:search/:page/:count', (req, res) => {
    res = getHeader(res);
    var search = req.params.search;
    var count = Number.parseInt(req.params.count);
    var page = Number.parseInt(req.params.page);

    mangaModel.getByName(count, page, search, function (mangasObj) {
        res.end(JSON.stringify((mangasObj)));
    });
});

app.get('/manga/autor/:auteur', (req, res) => {
    res = getHeader(res);
    var auteur = req.params.auteur;

    mangaModel.getByAuteur(auteur).then(function (mangas) {
        res.end(JSON.stringify(mangas));
    });
});


app.get('/manga/chapters/:id', (req, res) => {
    res = getHeader(res);
    var scanId = req.params.id;

    scanModel.getByScanId(scanId, function (obj) {
        res.end(JSON.stringify(obj));
    });
});

app.get('/manga/:id/chapters/:tome/:chapter/scans', (req, res) => {
    res = getHeader(res);
    var mangaId = req.params.id;
    var tome = req.params.tome;
    var chapter = req.params.chapter;

    scanModel.getScanWithIdAndNumero(mangaId, tome, chapter).then(function (obj) {
        res.end(JSON.stringify(obj));
    });
});

// Connected


app.get('/downloads/:userId', (req, res) => {
    res = getHeader(res);
    var userId = req.params.userId;

    async function getListDownload(listDownloads, callback) {
        var dls = [];
        for (var keyDownload in listDownloads) {
            var manga = await mangaModel.getByIdAsync(listDownloads[keyDownload].mangaId);
            dls.push({nom: manga.Nom, cover: manga.Cover[0] ? manga.Cover[0].img : null, scans:listDownloads[keyDownload].scans});
        }
        callback(dls);
    }
    
    downloadModel.getByUserId(userId, function(listDownloads) {

        getListDownload(listDownloads, function(dls) {
            res.end(JSON.stringify(dls));    
        });
    });
});

app.post('/download/:userId', (req, res) => {
    res = getHeader(res);
    var userId = req.params.userId;

    scanModel.getScansByNumeros(req.body.datas.scanId, req.body.datas.scans, function (scans) {
        downloadModel.insertDownload(userId, req.body.datas.mangaId, scans, function () {
        });
        mangaModel.getById(req.body.datas.mangaId, function(manga) {
            res.end(JSON.stringify({nom: manga.Nom, cover: manga.Cover[0] ? manga.Cover[0].img : null, scans:scans}));            
        });
    });

    return ;
});


/*
app.get('/downloadList', (req, res) => {
    mangaDB.connect(() => {
        mangaDB.getAllMangas(function (obj) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(obj));
        });
    });
});

app.post('/downloadList', (req, res) => {
    mangaDB.connect(() => {
        mangaDB.getAllMangas(function (obj) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(obj));
        });
    });
});


app.get('/library', (req, res) => {
    mangaDB.connect(() => {
        mangaDB.getAllMangas(function (obj) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(obj));
        });
    });
});

app.post('/library', (req, res) => {
    mangaDB.connect(() => {
        mangaDB.getAllMangas(function (obj) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(obj));
        });
    });
});

app.delete('/library', (req, res) => {
    mangaDB.connect(() => {
        mangaDB.getAllMangas(function (obj) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(obj));
        });
    });
});

// admin TODO

*/

async function init() {
    await mongo.connect();
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);