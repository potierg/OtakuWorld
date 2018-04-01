'use strict';

const Japscan = require('./src/Parsers/Japscan/japscan');
const MangaReader = require("./mangareader");
const MangaHere = require("./mangahere");
const ApiEden = require('./apiEden');
const Mongo = require('./mongo');

// App

const apiEden = new ApiEden();
const japscan = new Japscan();
const mangareader = new MangaReader();
const mangahere = new MangaHere();
var listMangas = null;
const mongo = new Mongo();

mongo.connect(() => {

  console.log(process.argv[2]);

  switch (process.argv[2]) {
    case 'japscan':
      apiEden.reset(() => {
        japscan.setEden(apiEden);
        japscan.setMongo(mongo);
        console.log("API LOAD");
        japscan.refreshMangaList(function () {
          console.log("END");
          process.exit();
        });
      });
      break;

    case 'japscan-scan':
      japscan.reloadVUS(mongo, () => {
        japscan.getMangaScan(mongo, function (o) {
          console.log("END");
          process.exit();
        });
      });
      break;

    case 'japscan-restart':
      japscan.restartDB(mongo, function (o) {
        console.log("END");
        process.exit();
      });
      break;


    case 'japscan-reload':
      japscan.reloadDB(mongo, function (o) {
        console.log("END");
        process.exit();
      });
      break;


    case 'get':
      mongo.getAllMangas((response) => {
        console.log(response.length);
      });
      break;

    }


  
});
