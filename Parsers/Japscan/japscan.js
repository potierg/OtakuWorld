'use strict';
var promise = require('promise');

const ApiEden = require('./apiEden');
const Mongo = require('../mongo');

const JapscanMangaParser = require("./src/Parsers/Japscan/japscanMangaParser");
const JapscanScanParser = require("./src/Parsers/Japscan/japscanScanParser");

// App

const apiEden = new ApiEden();
const mongo = new Mongo();


async function runJapscan() {
	await mongo.connect();
	await apiEden.reset();
	
	const japscanMangaParser = new JapscanMangaParser(mongo, apiEden);
	const japscanScanParser = new JapscanScanParser(mongo);

	japscanMangaParser.downloadMangaList(() => {
		japscanScanParser.downloadScans(function (result) {
			japscanMangaParser.resetVO(function() {
				process.exit();				
			});
		});
	});
}

runJapscan();
