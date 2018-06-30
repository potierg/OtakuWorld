'use strict';

// Constants
const PORT = 4521;
const HOST = '0.0.0.0';

const express = require('express');
const fs = require('fs');
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


// Folder Explorer

var dir = process.cwd();
app.use(express.static(dir)); //current working directory
app.use(express.static(__dirname)); //module directory


app.post('/files', function (req, res) {
    var currentDir = req.body.path ? req.body.path : dir + '\\';

    var data = {path: currentDir, folders: []};
    var l = currentDir.split("\\").length - 1;

    if (l > 1) {
        var back = currentDir.substring(0, currentDir.lastIndexOf('\\'));
        back = back.substring(0, back.lastIndexOf('\\') + 1);
        data.folders.push({ name: '.. (Back)', path: back });
    }

    fs.readdir(currentDir, function (err, files) {
        if (err) {
            throw err;
        }

        files.forEach(function (file) {
            try {
                var path = currentDir + file + '\\';
                var isDirectory = fs.statSync(path).isDirectory();
                if (isDirectory) {
                    data.folders.push({ name: file, path: path });
                }
            } catch (e) {
            }
        });
        res.end(JSON.stringify(data));
    });
})

// Downloader


app.post('/setList', (req, res) => {
    res = getHeader(res);
    var id = downloader.addDownload(req.body.list, req.body.path, req.body.nomManga);
    res.end(JSON.stringify({ id: id }));
});

app.post('/setListWithId/:id', (req, res) => {

    var idDL = req.params.id;
    res = getHeader(res);
    downloader.addDownloadWithId(req.body.list.scans, idDL);
    res.end(JSON.stringify({ id: idDL }));
});

app.get('/start/:id', (req, res) => {
    res = getHeader(res);
    var id = req.params.id;
    downloader.startDownload(parseInt(id));
    res.end(JSON.stringify({ state: 1 }));
});

app.get('/stop/:id', (req, res) => {
    res = getHeader(res);
    var id = req.params.id;
    downloader.stopDownload(id);
    res.end(JSON.stringify({ state: 1 }));
});

app.get('/status/:id', (req, res) => {
    res = getHeader(res);
    var id = req.params.id;
    var percent = downloader.getPercentDoneById(id);
    res.end(JSON.stringify({ p: percent }));
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);