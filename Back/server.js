'use strict';

const express = require('express');
const httpClient = require('./httpClient');

const Japscan = require('./japscan');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

const client = new httpClient();
const japscan = new Japscan();

var listMangas = null;

/* Site ID

    Japscan : 0
    MangaHere : 1
    ReadManga : 2
    MangaReader : 3

*/

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
        res.end(JSON.stringify({id: req.params.id, nom: ret.title, description: ret.description, auteur: ret.author, genre: ret.categories}));
    });
});

app.get('/mangas/site/:site_id/search/:nom', (req, res) => {
    japscan.getMangaList();
    res.end();
});

app.get('/mangas/site/:site_id/site_url', (req, res) => {
});

app.post('/mangas/download', (req, res) => {
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
