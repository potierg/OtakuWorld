'use strict';

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const express = require('express');
const app = express();
const cors = require('cors')
module.exports = app;

const crypto = require('crypto');
const header = require("./src/header");
const Mongo = require("./mongo");

const MangaModel = require('./database/mangasDB.js');
const ScanModel = require('./database/scansDB.js');
const DownloadModel = require("./database/downloadDB");
const UserModel = require("./database/usersDB");

var mongo = new Mongo();

init();

var mangaModel = new MangaModel(mongo);
var scanModel = new ScanModel(mongo);
var downloadModel = new DownloadModel(mongo);
var userModel = new UserModel(mongo);

const timeout = require('connect-timeout'); //express v4

app.use(timeout(1200000));
app.use(haltOnTimedout);

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors());

const { exec } = require('child_process');

function haltOnTimedout(req, res, next) {
    if (!req.timedout) next();
}

function getHeader(res) {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    /*res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin,Content-Type, Authorization, x-id, Content-Length, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");*/
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
    var userId = req.query.userId ? req.query.userId : -1;
    
    mangaModel.get(count, page, function (mangasObj) {
        if (userId == -1) {
            return res.end(JSON.stringify(mangasObj));
        }
        userModel.getById(userId, (user) => {
            for (var k in mangasObj.mangas) {
                var isFavorite = false;
                for (var i in user.favorite) {
                    if (user.favorite[i] == mangasObj.mangas[k]._id)
                        isFavorite = true;
                }
                mangasObj.mangas[k].isFavorite = isFavorite;
            }
            res.end(JSON.stringify(mangasObj));    
        });
    });
});

app.get('/manga/:id', (req, res) => {
    res = getHeader(res);
    var mangaId = req.params.id;
    var userId = req.query.userId ? req.query.userId : -1;

    mangaModel.getById(mangaId, async function (manga) {
        manga.isFavorite = await userModel.isMangaFavorite(userId, mangaId);
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
            dls.push({_id: listDownloads[keyDownload]._id, nom: manga.Nom, cover: manga.Cover[0] ? manga.Cover[0].img : null, scans:listDownloads[keyDownload].scans});
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
        downloadModel.insertDownload(userId, req.body.datas.mangaId, scans, function (dl) {
            mangaModel.getById(req.body.datas.mangaId, function(manga) {
                res.end(JSON.stringify({_id: dl[0]._id, nom: manga.Nom, cover: manga.Cover[0] ? manga.Cover[0].img : null, scans:scans}));            
            });
        });
    });

    return ;
});

app.delete('/download/:userId/:dlId', (req, res) => {
    res = getHeader(res);
    var userId = req.params.userId;
    var dlId = req.params.dlId;

    downloadModel.deleteDownload(userId, dlId, function() {
        res.end(JSON.stringify({}));
    });
    return ;
});

app.get('/favorite/:userId/:mangaId', (req, res) => {
    res = getHeader(res);
    var userId = req.params.userId;
    var mangaId = req.params.mangaId;

    userModel.updateFavorite(userId, mangaId, () => {
        res.end(JSON.stringify("OK"));        
    });
});

app.get('/user/:userId', (req, res) => {
    res = getHeader(res);
    var userId = req.params.userId;

    userModel.getById(userId, (user) => {
        mangaModel.getByIds(user.favorite, (list) => {
            user.favorite = list;
            res.end(JSON.stringify(user));
        });
    });
});

app.post('/login', (req, res) => {
    res = getHeader(res);
    var userDatas = req.body;

    userModel.getUser({login:userDatas.username, password:crypto.createHash('md5').update(userDatas.password).digest("hex")}, (user) => {
        if (user)
            res.end(JSON.stringify(user._id));
        else
            res.end(JSON.stringify(false));
    });
});

app.post('/signin', (req, res) => {
    res = getHeader(res);
    var userDatas = req.body;

    userDatas.password = crypto.createHash('md5').update(userDatas.password).digest("hex");
    userDatas.favorite = [];
    userModel.createUser(userDatas, (id) => {
        res.end(JSON.stringify(id));
    });
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