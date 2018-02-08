'use strict';

const httpClient = require('./httpClient');

const Japscan = require('./japscan');
const MangaReader = require("./mangareader");
const ApiEden = require('./apiEden');
const Mongo = require('./mongo');

// App

const apiEden = new ApiEden();

const client = new httpClient();
const japscan = new Japscan();
const mongo = new Mongo();
mongo.connect();
const mangareader = new MangaReader();

var listMangas = null;

console.log(process.argv[2]);

if (process.argv[2] == 'japscan') {
  apiEden.reset(() => {
    japscan.setEden(apiEden);
    console.log("API LOAD");
    japscan.getMangaList(mongo, function (o) {
      console.log("END");
      return ;
    });
  });
} else if (process.argv[2] == 'mangareader') {
  apiEden.reset(() => {
    japscan.setEden(apiEden);
    console.log("API LOAD");
    mangareader.getMangaList(mongo, function (obj) {
      console.log("END");
      return ;
    });
  });
} else if (process.argv[2] == 'all') {
  apiEden.reset(() => {
    japscan.setEden(apiEden);
    console.log("API LOAD");
    japscan.getMangaList(mongo, function (o) {
      mangareader.getMangaList(mongo, function (obj) {
        console.log("END");
        return ;
      });
    });
  });
}

