'use strict';

const express = require('express');
const httpClient = require('./httpClient');

const ApiEden = require('./apiEden');
const Mongo = require('./mongo');
var timeout = require('connect-timeout'); //express v4

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(timeout(1200000));
app.use(haltOnTimedout);

function haltOnTimedout(req, res, next) {
    if (!req.timedout) next();
}

const apiEden = new ApiEden();

const client = new httpClient();
const mongo = new Mongo();
//const mangareader = new MangaReader();
//const mangahere = new MangaHere();

var listMangas = null;

/* Site ID

    Japscan : 0
    MangaHere : 1
    ReadManga : 2
    MangaReader : 3

*/

//mongo.getAllMangas((docs) => { console.log(docs) });
//mongo.addManga({manga: {nom:"ma",auteur:"au",annee:"an",genre:["ge1", "ge2", "ge3"]}});

const JapscanMangaParser = require("./src/Parsers/Japscan/japscanMangaParser");
const JapscanScanParser = require("./src/Parsers/Japscan/japscanScanParser");

const japscanMangaParser = new JapscanMangaParser(); 
const japscanScanParser = new JapscanScanParser();

mongo.connect(() => {
    japscanMangaParser.setMongo(mongo);
    japscanScanParser.setMongo(mongo);
    
    app.get('/parser/japscan', (req, res) => {
        apiEden.reset(() => {
            japscanMangaParser.setEden(apiEden);
            japscanMangaParser.downloadMangaList(null);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(""));
        });
    });

    app.get('/parser/japscan/scans', (req, res) => {
        japscanScanParser.downloadScans(function (result) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));    
        });
    });    
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

return ;

app.get('/run/japscan', (req, res) => {
    mongo.connect(() => {
        apiEden.reset(() => {
            japscan.setEden(apiEden);
            console.log("API LOAD");
            japscan.getMangaList(mongo, function (obj) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(obj));
            });
        });
    });
});

app.get('/run/mangareader', (req, res) => {
    mangareader.getMangaList(mongo, function (obj) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(obj));
    });
});

app.get('/run/mangahere', (req, res) => {
    mongo.connect(() => {
        mangahere.getMangaList(mongo, function (obj) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(obj));
        });
    });
});

app.get('/getmangas', (req, res) => {
    mongo.connect(() => {
        mongo.getAllMangas((response) => {
            res.end(JSON.stringify(response));
        });
    });
});

app.get('/exec/bot', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    apiEden.reset(() => {
        japscan.setEden(apiEden);
        console.log("API LOAD");
        japscan.getMangaList(mongo, function (o) {
            mangareader.getMangaList(mongo, function (obj) {
                res.end(JSON.stringify("END"));
            });
        });
    });
});


app.get('/mangas/list/:site_id', (req, res) => {
    var page = parseInt(req.query.page);
    var count = parseInt(req.query.count);
    switch (parseInt(req.params.site_id)) {
        case 0:
            japscan.getMangaList(page, count, function (obj) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(obj));
            });
            break;
        default:
            res.end("END");
            break;
    }
});



app.get('/mangas', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (listMangas != null)
        res.end(JSON.stringify(listMangas));
    else {
        client.get('http://www.mangaeden.com/api/list/0/', (ret_raw) => {
            listMangas = [];
            var ret = JSON.parse(ret_raw)['manga'];

            for (var keyOneManga in ret) {
                var oneM = ret[keyOneManga];
                listMangas.push({ id: oneM.i, title: oneM.t, genre: oneM.c, cover: 'http://cdn.mangaeden.com/mangasimg/200x/' + oneM.im });
            }

            res.end(JSON.stringify(listMangas));
        });
    }
});

app.get('/mangas/search/:string', (req, res) => {

    var searchMangaList = [];
    if (!listMangas) {
        res.end();
        return;
    }

    for (var keyOneManga in listMangas) {
        if (listMangas[keyOneManga].title.toUpperCase().indexOf(req.params.string.toUpperCase()) !== -1)
            searchMangaList.push(listMangas[keyOneManga]);
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(searchMangaList));
});

app.get('/mangas/details/:id', (req, res) => {
    client.get('http://www.mangaeden.com/api/manga/' + req.params.id, (ret_raw) => {
        var ret = JSON.parse(ret_raw);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ id: req.params.id, nom: ret.title, description: ret.description, auteur: ret.author, genre: ret.categories }));
    });
});


app.get('/mangas/site/:site_id/list', (req, res) => {
    japscan.getMangaList(function (obj) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(obj));
    });
});

app.get('/mangas/site/:site_id/search/:nom', (req, res) => {
    japscan.searchManga(req.params.nom, function (obj) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(obj));
    });
});

app.get('/mangas/site/:site_id/site_url', (req, res) => {
});

app.post('/mangas/download', (req, res) => {
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
