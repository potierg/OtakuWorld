'use strict';
const MangaModel = require('../../Models/MangaModel');

const BabyWorkers = require('baby-workers');
var promise = require('promise');

const HtmlJapscanListChapters = require('./html-Japscan-List-Chapters');
const HtmlJapscanScans = require('./html-Japscan-Scans');

const htmlJapscanListChapters = new HtmlJapscanListChapters();
const htmlJapscanScans = new HtmlJapscanScans();

module.exports = class JapscanScanParser {

    constructor() {
        this.siteLink = "http://www.japscan.cc";
        this.mongo = null;
    }

    setMongo(mongo) {
        this.mongo = mongo;
    }

    downloadScans(callback) {
        var th = this;
        this.mongo.getMangaNotUpdate((manga) => {
            if (manga !== null) {
                console.log("Download", manga.Nom, "Scans");
                manga.data.japscan.state = 1;
                th.mongo.updateManga(manga._id, manga, () => {
                    var idScan = manga.data.japscan.scanId ? manga.data.japscan.scanId : null;
                    th.mongo.getScanById(idScan, (savedScans) => {
                        
                        var savedTomes = savedScans ? savedScans.scans : null;

                        htmlJapscanListChapters.run(manga.data.japscan.link, manga.Nom, function(listTomes) {

                            if (savedScans) {
                                for (var keyTome in listTomes) {

                                    var goodSaveTome = null;
                                    for (var keySavedTome in savedTomes) {
                                        if (listTomes[keyTome].nb == savedTomes[keySavedTome].nb)
                                        {
                                            goodSaveTome = savedTomes[keySavedTome];
                                            break;
                                        }
                                    }

                                    if (listTomes[keyTome].chapters) {

                                        for (var keyChapter in listTomes[keyTome].chapters) {                                        
                                            var goodSaveChapter = null;
                                            for (var keySavedChapter in goodSaveTome.chapters) {
                                                if (listTomes[keyTome].chapters[keyChapter].nb == goodSaveTome.chapters[keySavedChapter].nb)
                                                {
                                                    goodSaveChapter = goodSaveTome.chapters[keySavedChapter];
                                                    break;
                                                }
                                            }
                                            if (goodSaveChapter) {
                                                if (goodSaveChapter.link)
                                                    listTomes[keyTome].chapters[keyChapter].link = goodSaveChapter.link;                                        
                                                listTomes[keyTome].chapters[keyChapter].pages = goodSaveChapter.pages;
                                            }
                                        }
                                    } else if (goodSaveTome) {
                                        if (goodSaveTome.link)
                                            listTomes[keyTome].link = goodSaveTome.link;
                                        listTomes[keyTome].pages = goodSaveTome.pages;
                                    }
                                }
                            }

                            var isAllScanValid = true;
                            var babyWorkers = new BabyWorkers;
                            babyWorkers.create('downloadTome', (worker, tome) => {

                                if (tome.chapters) {
                                    worker.create('downloadChapter', (worker2, chapter) => {
                                        if (!chapter.pages && !chapter.flag) {
                                            htmlJapscanScans.run(chapter.link, function(res) {
                                                delete chapter.link;
                                                if (res.link)
                                                    chapter.link = res.link;
                                                chapter.pages = res.pages;
                                                worker2.pop();
                                            });    
                                        } else if (chapter.flag) {
                                            isAllScanValid = false;
                                            worker2.pop();
                                        } else
                                            worker2.pop();
                                    }).map(tome.chapters).limit(1).run();

                                    worker.downloadChapter.complete(() => {
                                        worker.pop();
                                    });
            
                                } else if (!tome.pages && !tome.flag){
                                    htmlJapscanScans.run(tome.link, function(res) {
                                        delete tome.link;
                                        if (res.link)
                                            tome.link = res.link;
                                        tome.pages = res.pages;
                                        worker.pop();
                                    });
                                } else if (tome.flag) {
                                    isAllScanValid = false;
                                    worker.pop();
                                } else
                                    worker.pop();
                            }).map(listTomes).limit(1).run();
                
                            babyWorkers.downloadTome.complete(() => {

                                th.mongo.updateScans({ mangaId: manga._id, scans: listTomes }, (id) => {
                                    manga.data.japscan.scanId = id;
                                    if (isAllScanValid)
                                        manga.data.japscan.state = 2;
                                    else
                                        manga.data.japscan.state = 3;
                                    th.mongo.updateManga(manga._id, manga, () => {
                                        return th.downloadScans(callback);
                                    });
                                });
                            });
                        });
                    });
                    return;
                });
            }
            else {
                return callback();
            }
        });
    }
}