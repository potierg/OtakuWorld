'use strict';

// Constants
const PORT = 4242;
const HOST = '0.0.0.0';

const express = require('express');
const app = express();
const cors = require('cors')
module.exports = app;

const header = require("./src/header");
const Downloader = require('./src/downloader');

var downloader = new Downloader();

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
    res.header('Content-Type', 'application/json');
    return res;
}

app.post('/setList', (req, res) => {
    res = getHeader(res);
    var id = downloader.addDownload(req.body.list);
    console.log(id);
    res.end(JSON.stringify({id: id}));
});

app.get('/start/:id', (req, res) => {
    res = getHeader(res);
    var id = req.params.id;
    downloader.startDownload(parseInt(id));
    res.end(JSON.stringify({state: 1}));
});

app.get('/stop/:id', (req, res) => {
    res = getHeader(res);
    var id = req.params.id;
    downloader.stopDownload(id);
    res.end(JSON.stringify({state: 1}));
});

app.get('/status/:id', (req, res) => {
    res = getHeader(res);
    var id = req.params.id;
    var percent = downloader.getPercentDoneById(id);
    res.end(JSON.stringify({p: percent}));
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);