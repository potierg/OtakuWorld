'use strict';

const ApiEden = require('./apiEden');
const Mongo = require('./mongo');

const JapscanMangaParser = require("./src/Parsers/Japscan/japscanMangaParser");
const JapscanScanParser = require("./src/Parsers/Japscan/japscanScanParser");

// App

const apiEden = new ApiEden();
const mongo = new Mongo();

const japscanMangaParser = new JapscanMangaParser(); 
const japscanScanParser = new JapscanScanParser();

mongo.connect(() => {
	japscanMangaParser.setMongo(mongo);
	japscanScanParser.setMongo(mongo);
		
	apiEden.reset(() => {
		japscanMangaParser.setEden(apiEden);
		japscanMangaParser.downloadMangaList(() => {
			japscanScanParser.downloadScans(function (result) {
				process.exit();
			});
		});
	});
});
