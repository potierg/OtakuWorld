'use strict';

const JapscanParser = require('./japscanParser');
const MangaModel = require('../../Models/MangaModel');

const webSniffer = require('web-sniffer-js');
const BabyWorkers = require('baby-workers');
const { exec } = require('child_process');
var fs = require('fs');
const sniffer = new webSniffer;

module.exports = class Japscan {

    constructor() {
        this.edenList = null;
        this.mongo;
        this.japscanParser = new JapscanParser();
        this.mangaModel = new MangaModel();
    }

    setEden(eden) {
        this.Eden = eden;
        this.japscanParser.setEden(eden);
    }

    setMongo(mongo) {
        this.mongo = mongo;
        this.japscanParser.setMongo(this.mongo);
    }

    refreshMangaList(cb) {
        this.japscanParser.loadMangaList(() => {
            cb();
        });
    }

    executeDownloadScans() {

    }

    restartDB(mongo, callback) {
        mongo.getMangaCrashed((mangas) => {

            var babyWorkers = new BabyWorkers;
            babyWorkers.create('restart', (worker, manga) => {
                manga.data.japscan.state = 0;
                mongo.updateManga(manga._id, manga, () => {
                    worker.pop();
                });

            }).map(mangas).limit(1).run();

            babyWorkers.restart.complete(() => {
                callback();
            });
        });
    }

    reloadDB(mongo, callback) {
        mongo.getScansByScanNull((scans) => {

            var babyWorkers = new BabyWorkers;
            babyWorkers.create('reload', (worker, element) => {

                var isScanNull = false;
                if (element.scans == null)
                    isScanNull = true;

                mongo.getMangaById(element.mangaId, (manga) => {
                    console.log("update", manga._id, manga.Nom);
                    if (isScanNull)
                        manga.data.japscan.scanId = null;
                    manga.data.japscan.state = 0;
                    mongo.updateManga(manga._id, manga, () => {

                        if (isScanNull)
                            mongo.deleteScansByMangaId(manga._id);
                        worker.pop();
                    });
                });
            }).map(scans).limit(1).run();

            babyWorkers.reload.complete(() => {
                callback();
            });
        });
    }

    reloadVUS(mongo, callback) {
        mongo.getScansByScanVUS((scans) => {

            var babyWorkers = new BabyWorkers;
            babyWorkers.create('reload', (worker, element) => {

                var isScanNull = false;
                if (element.scans == null)
                    isScanNull = true;

                mongo.getMangaById(element.mangaId, (manga) => {
                    console.log("VUS - update", manga._id, manga.Nom);
                    manga.data.japscan.state = 0;
                    mongo.updateManga(manga._id, manga, () => {
                        worker.pop();
                    });
                });
            }).map(scans).limit(1).run();

            babyWorkers.reload.complete(() => {
                callback();
            });
        });
    }

    getMangaScan(mongo, callback) {

        mongo.getMangaNotUpdate((manga) => {
            if (manga !== null) {
                console.log("Download", manga.Nom, "Scans");
                manga.data.japscan.state = 1;
                mongo.updateManga(manga._id, manga, () => {
                    this.downloadOneManga(mongo, manga, (list) => {
                        mongo.updateScans({ mangaId: manga._id, scans: list }, (id) => {
                            manga.data.japscan.scanId = id;
                            manga.data.japscan.state = 2;
                            mongo.updateManga(manga._id, manga, () => {
                                return this.getMangaScan(mongo, callback);
                            });
                        });
                    })
                });
            }
            else {
                callback();
                return ;
            }
        });
    }

    downloadOneManga(mongo, manga, callback) {

        mongo.getScanById(manga._id, (savedScans) => {
            exec('curl ' + manga.data.japscan.link, (err, stdout, stderr) => {
                sniffer.parseWithFile(stdout, (htmlObject) => {

                    if (!savedScans) {
                        savedScans = { scans: [] };
                    }

                    // Get Tomes & Chapitres

                    var chapsHtml = sniffer.search("div|[id=\"liste_chapitres\"]");
                    var currentTome = { chapters: [] };
                    var listTome = [];

                    for (var keyLine in chapsHtml) {
                        var line = chapsHtml[keyLine];
                        if (!line.next) {

                            if (currentTome.chapters.length > 0 && listTome.length == 0)
                                listTome.push({nomTome: 'Last', numero: -42, chapters: currentTome.chapters});

                            currentTome = {};
                            var info = line.value;
                            var pos = info.indexOf(":");
                            var vol = "";
                            if (pos > 0) {
                                currentTome.nomTome = info.substring(pos + 1).trim();
                                vol = info.substring(0, pos - 1).trim();
                            } else
                                vol = info.trim();

                            if (vol && vol.match(/\d+/g))
                                currentTome.numero = vol.match(/\d+/g).map(Number)[0];
                            currentTome.chapters = [];
                            listTome.push(currentTome);
                        }
                        else {
                            for (var keyLine2 in line.next) {
                                var chap = line.next[keyLine2].next[0];
                                var pos = chap.value.indexOf(":");
                                var nb = "";
                                var chapter = {};
                                if (line.next[keyLine2].next[1]) {
                                    if (line.next[keyLine2].next[1].value.indexOf("SPOILER") != -1 || 
                                        line.next[keyLine2].next[1].value.indexOf("VUS") != -1 || 
                                        line.next[keyLine2].next[1].value.indexOf("RAW") != -1)
                                        chapter.isUs = true;
                                }
                                if (pos > 0) {
                                    chapter.nomChap = chap.value.substring(pos + 1).trim();
                                    nb = chap.value.substring(0, pos - 1).trim();
                                } else
                                    nb = chap.value.trim();

                                if (nb && nb.match(/\d+/g)) {
                                    chapter.numero = nb;
                                    if (chapter.numero.indexOf("Volume") === -1 && chapter.numero.indexOf("Épisode") === -1)
                                        chapter.numero = nb.substring(manga.Nom.length + 5);
                                    else
                                        chapter.numero = chapter.numero.substring(0, chapter.numero.indexOf(':'));
                                    if (chapter.numero) {
                                        chapter.numero = chapter.numero.match(/[+-]?\d+(\.\d+)?/g).map(function (v) { return parseFloat(v); })[0];
                                    }
                                }
                                chapter.linkJapscan = chap.content[0].replace("href=\"//", "").replace("\"", "");
                                if (currentTome.chapters)
                                    currentTome.chapters.push(chapter);
                            }
                        }
                    }

                    if (listTome.length == 0) {
                        listTome = [{ numero: 1, chapters: currentTome.chapters }];
                    }

                    for (var keyTome in listTome) {
                        var Tome = listTome[keyTome];
                        if (Tome.chapters.length == 1) {
                            Tome.linkJapscan = Tome.chapters[0].linkJapscan;
                            if (Tome.chapters[0].pages)
                                Tome.pages = Tome.chapters[0].pages;
                            delete (Tome.chapters);
                        }
                    }
                    for (var keyTome in listTome) {
                        var Tome = listTome[keyTome];
                        var validTomeDB;

                        for (var keyTome2 in savedScans.scans) {
                            if (savedScans.scans[keyTome2] != null && !savedScans.scans[keyTome2].isUs && savedScans.scans[keyTome2].numero == Tome.numero)
                                validTomeDB = savedScans.scans[keyTome2];
                        }

                        if (validTomeDB && Tome.chapters) {

                            for (var keyChapter in Tome.chapters) {

                                for (var keyChapter2 in validTomeDB.chapters) {

                                    if (validTomeDB.chapters[keyChapter] && !validTomeDB.chapters[keyChapter].isUs && Tome.chapters[keyChapter].numero == validTomeDB.chapters[keyChapter2].numero
                                        && validTomeDB.chapters[keyChapter2].pages)
                                        Tome.chapters[keyChapter].pages = validTomeDB.chapters[keyChapter2].pages;
                                }
                            }

                        } else if (validTomeDB && validTomeDB.pages)
                            Tome.pages = validTomeDB.pages;
                    }

                    listTome = listTome.reverse();

                    var worker = new BabyWorkers;

                    worker.create('listOneChap', (worker2, chap) => {

                        if (chap.chapters) {
                            worker2.create('getChapters', (worker3, c) => {
                                if (!c.pages || c.pages.indexOf(false) !== -1) {
                                    this.getOneChapter(c, worker3, (r) => {
                                        if (r) {
                                            if (r.encrypt > 0)
                                                c.encrypt = r.encrypt;
                                            c.pages = r.pages;
                                        }
                                        worker3.pop();
                                    });
                                } else
                                    worker3.pop();
                            }).map(chap.chapters).limit(1).run();

                            worker2.getChapters.complete(() => {
                                worker2.pop();
                            });
                        } else if (!chap.pages || chap.pages.indexOf(false) !== -1) {
                            this.getOneChapter(chap, worker2, (r) => {
                                if (r) {
                                    if (r.encrypt > 0)
                                        chap.encrypt = r.encrypt;
                                    chap.pages = r.pages;
                                }
                                worker2.pop();
                            });
                        }
                        else
                            worker2.pop();
                    }).map(listTome).limit(1).run();

                    worker.listOneChap.complete(() => {
                        callback(listTome);
                    });

                });
            });
        });
    }

    getOneChapter(chap, worker, callback) {

        var listPages = [];
        var t = this;

        console.log("Download => ", chap.linkJapscan);

        exec('curl http://' + chap.linkJapscan, (err, stdout, stderr) => {
            sniffer.parseWithFile(stdout, (htmlObject) => {

                var listLink = [];
                var allPages = sniffer.search("select|[id=\"pages\"]");
                var posDivImage = sniffer.search("div|[id=\"images\"]");

                var posLDiv = sniffer.search("a|[id=\"img_link\"]");
                var posIDiv = sniffer.search("div|[id=\"parImg\"]");

                if (!allPages) {
                    callback(null);
                    return;
                }

                if (posDivImage) {

                    var linkFirstPage = posDivImage[0].next[0].next[0].content[4].replace("src=\"", "").replace("\"", "");
                    var firstData = allPages[0].content[1].replace("data-img=\"", "").replace("\"", "");

                    linkFirstPage = linkFirstPage.replace(firstData, "");

                    allPages.map((i) => {
                        var cnt = 0;
                        if (i.content[0].indexOf("selected") !== -1)
                            cnt = 1;

                        var data = i.content[cnt].replace("data-img=\"", "").replace("\"", "");

                        if (data.indexOf('IMG') != -1) {
                            var ext = firstData.substring(firstData.lastIndexOf('.'));
                            var data2 = i.content[cnt + 1].replace("value=\"#img", "").replace("\"", "");
                            data = data2+ext;
                        }

                        listPages.push(linkFirstPage+data);
                    });

                    callback({ encrypt: 2, pages: listPages });                    
                    return ;

                }

                if (!posDivImage && !posLDiv && !posIDiv) {

                    var f = sniffer.search("body")[2].next;
                    var uri_chap = f[1].content[2].replace("data-uri=\"", "").replace("\"", "");
                    var nom_chap = f[1].content[0];

                    if (nom_chap && nom_chap.indexOf("name"))
                        nom_chap = nom_chap.replace("name=\"", "").replace("\"", "");
                    else
                        nom_chap = null;
                    var nom_manga = f[0].content[2].replace("data-nom=\"", "").replace("\"", "");                    

                    allPages.map((i) => {
                        var cnt = 0;
                        if (i.content[0].indexOf("selected") !== -1)
                            cnt = 1;

                        var data = i.content[cnt].replace("data-img=\"", "").replace("\"", "");
                        if (data.indexOf('IMG') == -1) {
                            var link = "http://c.japscan.cc/cr_images/" + nom_manga.replace('/', '_').replace('?', '') + '/' + (nom_chap == null ? uri_chap : nom_chap) + '/' + data;
                            listPages.push(link);
                        }
                    });

                    callback({ encrypt: 3, pages: listPages });                    
                    return ;
                }

                allPages.map((i) => {

                    var cnt = 0;
                    if (i.content[0].indexOf("selected") !== -1)
                        cnt = 1;

                    if (i.content[cnt].indexOf("IMG") === -1) {

                        if (i.content[cnt + 1].indexOf("value=") == -1)
                            cnt++;

                            var l = "http://www.japscan.cc" + i.content[cnt + 1].replace("value=\"", "").replace("\"", "").trim();
                        for (var i = 1; i <= 9; i++)
                            l = l.replace("0" + i + ".html", i + ".html");

                        listLink.push(l);
                    }
                });
                var encrypt = 0;
                worker.create('onePage', (worker2, pageUrl) => {
                    if (pageUrl.indexOf("http://www.japscan.cc#") == 0) {
                        listPages.push(false);
                        worker2.pop();
                    } else if (pageUrl.indexOf('#') == -1) {
                        exec("curl " + pageUrl, (err, stdout, stderr) => {
                            sniffer.parseWithFile(stdout, (htmlObject) => {
                                var l = sniffer.search("a|[id=\"img_link\"]");
                                var i = sniffer.search("div|[id=\"parImg\"]")
                                if (l) {
                                    l = l[0].content[4].replace("src=\"", "").replace("\"", "").trim();
                                } else {
                                    if (i !== false) {
                                        var f = sniffer.search("body")[2].next;


                                        var uri_chap = f[1].content[2].replace("data-uri=\"", "").replace("\"", "");

                                        var nom_chap = f[1].content[0];
                                        if (nom_chap && nom_chap.indexOf("name"))
                                            nom_chap = nom_chap.replace("name=\"", "").replace("\"", "");
                                        else
                                            nom_chap = null;

                                        var nom_manga = f[0].content[2].replace("data-nom=\"", "").replace("\"", "");
                                        var nom_image = i[0].content[1].replace("data-img=\"", "").replace("\"", "");

                                        var finalLink = 'http://cd151.d836pbl.club/cr_images/' + nom_manga.replace("/", "_").replace("?", "") + "/" + (nom_chap == null ? uri_chap : nom_chap) + '/' + nom_image;

                                        l = finalLink;
                                        encrypt = 1;
                                    } else {
                                        l = false;
                                        fs.appendFile("./error.txt", chap.linkJapscan + " - " + pageUrl + "\n", function (err) { });
                                        console.log("Error", chap.linkJapscan + " - " + pageUrl);
                                    }
                                }

                                listPages.push(l);
                                sniffer.clean();
                                worker2.pop();
                            });
                        });
                    }
                }).map(listLink).limit(100).run();

                worker.onePage.complete(() => {

                    listPages = listPages.sort((a, b) => {
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    });

                    callback({ encrypt: encrypt, pages: listPages });
                });
                return;
            });
        });
    }
}
