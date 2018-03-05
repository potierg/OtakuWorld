'use strict';

const webSniffer = require('web-sniffer-js');
const babyWorkers = require('baby-workers');
const { exec } = require('child_process');
var fs = require('fs');
const sniffer = new webSniffer;

module.exports = class Japscan {

    constructor() {
        this.edenList = null;
    }

    setEden(eden) {
        this.Eden = eden;
    }

    getMangaList(mongo, callback) {
        this.babyWorkers = new babyWorkers;
        sniffer.clean();
        console.log("Get Mangas List");
        sniffer.parseWithLink("http://www.japscan.com/mangas/", (htmlObject) => {
            var listHtml = sniffer.search("div|[id=\"liste_mangas\"]");
            var mangaList = [];

            for (var elemHtmlKey in listHtml) {
                var elemHtml = listHtml[elemHtmlKey];
                if (elemHtml.content[0] !== "class=\"thead\"" && elemHtml.next[0].next[0].value != null) {
                    mangaList.push({
                        nomFR: elemHtml.next[0].next[0].value,
                        genre: elemHtml.next[1].value,
                        statut: elemHtml.next[2].value,
                        url: "http://www.japscan.com" + elemHtml.next[0].next[0].content[0].replace("href=\"", "").replace("\"", ""),
                    });
                }
            }

            var t;
            console.log("Done Start Download =>", mangaList.length);

            var mangaLength = mangaList.length;
            this.babyWorkers.create('listMangas', (worker, manga) => {
                console.log('Japscan - Manga pushed', parseInt(worker.getId()) + 1, '/', mangaLength, '-', Math.round((parseInt(worker.getId()) / mangaLength) * 100), '%', manga.url);
                this.getOneManga(mongo, worker, manga);
            }).map(mangaList.slice(80)).limit(1).run()


            this.babyWorkers.listMangas.complete(() => {
                callback({});
            });

            return;
        });
    }

    getOneManga(mongo, worker, manga) {

        mongo.getMangaByName(manga.nomFR, (info) => {
            sniffer.clean();
            var mdb = info;
            exec('curl ' + manga.url, (err, stdout, stderr) => {
                sniffer.parseWithFile(stdout, (htmlObject) => {

                    var savedManga = null;
                    var id = 0;

                    if (mdb) {
                        savedManga = mdb;
                        id = mdb._id;
                    }

                    if (savedManga == null) {
                        savedManga = {
                            Nom: "", Genre: [], 'Nom Alternatif': [], Synopsis: {},
                            Statut: manga.statut, 'Sortie Initial': "", Auteur: [], Cover: {},
                        }
                    }

                    savedManga.Nom = savedManga.Nom != "" ? savedManga.Nom : manga.nomFR;

                    if (savedManga.Genre.indexOf(manga.genre.trim()) === -1)
                        savedManga.Genre.push(manga.genre.trim())

                    if (savedManga['Nom Alternatif'].indexOf(savedManga.Nom) === -1)
                        savedManga['Nom Alternatif'].push(savedManga.Nom);

                    if (savedManga['Nom Alternatif'].indexOf(manga.nomFR.toLowerCase()) === -1)
                        savedManga['Nom Alternatif'].push(manga.nomFR.toLowerCase());

                    var synopsisHtml = sniffer.search("div|[class=\"content\"]{0}");
                    if (synopsisHtml[3] && synopsisHtml[3].value && !savedManga.Synopsis.FR)
                        savedManga.Synopsis.FR = synopsisHtml[3].value.trim();

                    var tableHtml = sniffer.search("div|[class=\"table\"]");
                    var t = sniffer.formatTable(tableHtml);
                    for (var k in t[0]) {
                        if (k != 'Genre' && k != 'Terminé Le')
                            if (k == "Nom Alternatif") {
                                t[0][k].toLowerCase().split(",").map(function (s) {
                                    if (savedManga['Nom Alternatif'].indexOf(s.trim()) === -1)
                                        savedManga['Nom Alternatif'].push(s.trim())
                                });
                            }
                            else if (k == "Auteur") {
                                if (t[0][k].indexOf(";") !== -1)
                                    t[0][k].toLowerCase().split(";").map(function (s) {
                                        if (savedManga['Auteur'].indexOf(s.trim()) === -1)
                                            savedManga['Auteur'].push(s.trim())
                                    });
                                else
                                    t[0][k].toLowerCase().split(",").map(function (s) {
                                        if (savedManga['Auteur'].indexOf(s.trim()) === -1)
                                            savedManga['Auteur'].push(s.trim())
                                    });
                            }
                            else if (!savedManga[k])
                                savedManga[k] = t[0][k];
                    }

                    // Get Tomes & Chapitres

                    var chapsHtml = sniffer.search("div|[id=\"liste_chapitres\"]");
                    var currentTome = { chapters: [] };
                    var listTome = [];

                    for (var keyLine in chapsHtml) {
                        var line = chapsHtml[keyLine];
                        if (!line.next) {
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
                                if (pos > 0) {
                                    chapter.nomChap = chap.value.substring(pos + 1).trim();
                                    nb = chap.value.substring(0, pos - 1).trim();
                                } else if (info)
                                    nb = chap.value.trim();

                                if (nb && nb.match(/\d+/g)) {
                                    chapter.numero = nb;
                                    if (chapter.numero.indexOf("Volume") === -1 && chapter.numero.indexOf("Épisode") === -1)
                                        chapter.numero = nb.substring(manga.nomFR.length + 5);
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

                        for (var keyTome2 in savedManga.Japscan) {
                            if (savedManga.Japscan[keyTome2].numero == Tome.numero)
                                validTomeDB = savedManga.Japscan[keyTome2];
                        }

                        if (validTomeDB && Tome.chapters) {

                            for (var keyChapter in Tome.chapters) {

                                for (var keyChapter2 in validTomeDB.chapters) {

                                    if (Tome.chapters[keyChapter].numero == validTomeDB.chapters[keyChapter2].numero
                                        && validTomeDB.chapters[keyChapter2].pages)
                                        Tome.chapters[keyChapter].pages = validTomeDB.chapters[keyChapter2].pages;
                                }
                            }

                        } else if (validTomeDB && validTomeDB.pages)
                            Tome.pages = validTomeDB.pages;
                    }
                    savedManga.Japscan = listTome.reverse();

                    worker.create('listOneChap', (worker2, chap) => {

                        if (chap.chapters) {
                            worker2.create('getChapters', (worker3, c) => {
                                if (!c.pages || c.pages.indexOf(false) !== -1) {
                                    this.getOneChapter(c, worker3, (r) => {
                                        if (r)
                                            c.pages = r;
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
                                if (r)
                                    chap.pages = r;
                                worker2.pop();
                            });
                        }
                        else
                            worker2.pop();
                    }).map(savedManga.Japscan).limit(1).run();

                    worker.listOneChap.complete(() => {
                        if (!savedManga.Cover.eden) {
                            var m = this.Eden.search(savedManga.nomFR);
                            if (!m)
                                m = this.Eden.search(savedManga['Nom Alternatif'][0]);

                            if (m != null)
                                savedManga.Cover.eden = m.cover;
                        }

                        mongo.deleteMangaById(id, () => {
                            mongo.addManga(savedManga, () => {
                                if (worker)
                                    worker.pop();
                            });
                        })
                    });
                });
            });
        });
    }

    getOneChapter(chap, worker, callback) {

        var listPages = [];

        exec('curl http://' + chap.linkJapscan, (err, stdout, stderr) => {
            sniffer.parseWithFile(stdout, (htmlObject) => {

                var listLink = [];
                var allPages = sniffer.search("select|[id=\"pages\"]");

                if (!allPages) {
                    callback(null);
                    return;
                }

                allPages.map((i) => {

                    var cnt = 0;
                    if (i.content[0].indexOf("selected") !== -1)
                        cnt = 1;

                    if (i.content[cnt].indexOf("IMG") === -1) {

                        var l = "http://www.japscan.com" + i.content[cnt + 1].replace("value=\"", "").replace("\"", "").trim();
                        for (var i = 1; i <= 9; i++)
                            l = l.replace("0" + i + ".html", i + ".html");

                        listLink.push(l);
                    }
                });
                worker.create('onePage', (worker2, pageUrl) => {
                    if (pageUrl.indexOf("http://www.japscan.com#") == 0) {
                        listPages.push(false);
                        worker2.pop();
                    } else {
                        exec("curl " + pageUrl, (err, stdout, stderr) => {
                            sniffer.parseWithFile(stdout, (htmlObject) => {
                                var l = sniffer.search("a|[id=\"img_link\"]");
                                if (l == false) {
                                    fs.appendFile("./error.txt", chap.linkJapscan + " - " + pageUrl + "\n", function (err) { });
                                    console.log("Error", chap.linkJapscan + " - " + pageUrl);
                                }
                                else
                                    l = l[0].content[4].replace("src=\"", "").replace("\"", "").trim();
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

                    callback(listPages);
                });
                return;
            });
        });
    }
}
