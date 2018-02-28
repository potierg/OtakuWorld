'use strict';

const webSniffer = require('web-sniffer-js');
const babyWorkers = require('baby-workers');
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


            console.log(mangaList[14]);
            this.getOneManga(mongo, null, mangaList[14], (r) => {
                callback(r);
            });
            return;

            console.log("Done Start Download =>", mangaList.length);

            var mangaLength = mangaList.length;
            this.babyWorkers.create('listMangas', (worker, manga) => {
                //console.log('Japscan - Manga pushed', parseInt(worker.getId()) + 1, '/', mangaLength, '-', Math.round((parseInt(worker.getId()) / mangaLength) * 100), '%');
                this.getOneManga(mongo, worker, manga);
            }).map(mangaList).limit(100).run() // .stack();


            this.babyWorkers.listMangas.complete(() => {
                callback({});
            });

            return;
        });
    }

    getOneManga(mongo, worker, manga, callback) {

        mongo.getMangaByName(manga.nomFR, (info) => {
            sniffer.clean();
            sniffer.parseWithLink(manga.url, (htmlObject) => {

                var savedManga = null;
                var id = 0;

                if (info) {
                    savedManga = info;
                    id = info._id;
                    console.log("Exist =>", savedManga.Nom);
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
                        delete (Tome.chapters);
                    }
                }

                savedManga.Japscan = listTome.reverse();


                console.log(savedManga.Japscan[0]);

                this.getOneChapter(savedManga.Japscan[0], (r) => {
                    //savedManga.Japscan[0].pages = r;
                    callback(r);
                })

                return;



                var bw = new babyWorkers;

                /*bw.create('listOneChap', (worker, chap) => {

                    console.log(chap);
                    this.getOneChapter(chap, (r) => {
                        chap.pages = r;
                        worker.pop();
                    })

                }).map(savedManga.Japscan).limit(1).run();*/


                bw.listOneChap.complete(() => {
                    if (!savedManga.Cover.eden) {
                        var m = this.Eden.search(savedManga.nomFR);
                        if (!m)
                            m = this.Eden.search(savedManga['Nom Alternatif'][0]);

                        if (m != null)
                            savedManga.Cover.eden = m.cover;
                    }

                    callback(savedManga);
                    return;

                    /*mongo.deleteMangaById(id, () => {
                        mongo.addManga(savedManga, () => {
                            if (worker)
                                worker.pop();
                        });
                    })*/
                });

            });
        });
    }

    getOneChapter(chap, callback) {

        var listPages = [];

        console.log("Get chapter");
        sniffer.parseWithLink('http://' + chap.linkJapscan, (htmlObject) => {

            var listLink = [];
            var allPages = sniffer.search("select|[id=\"pages\"]");

            allPages.map((i) => {

                var cnt = 0;
                if (i.content[0].indexOf("selected") !== -1)
                    cnt = 1;

                if (i.content[cnt].indexOf("IMG") === -1) {
                    listLink.push("http://www.japscan.com" + i.content[cnt + 1].replace("value=\"", "").replace("\"", "").trim());
                }
            });

            var firstImg = sniffer.search("a|[id=\"img_link\"]")[0].content[4].replace("src=\"", "").replace("\"", "").trim();

            console.log(listLink[0]);
            sniffer.parseWithLink(listLink[0], (htmlObject) => {

                callback(htmlObject);
                return ;

            });

            return;

            /*var bw = new babyWorkers;

            bw.create('onePage', (worker, pageUrl) => {

                sniffer.parseWithLink(pageUrl, (htmlObject) => {

                    callback(htmlObject);
                    return ;
                    console.log(pageUrl);
                    var img = sniffer.search("div|[itemtype=\"http://schema.org/Article\"]");
                    console.log(img);
                    img = img[0].content[4].replace("src=\"", "").replace("\"", "").trim();
                    console.log(img);
                    listPages.push(img);

                    worker.pop();
                });
            }).map(listLink).limit(1).run();*/

            return;


            bw.onePage.complete(() => {
                callback(listPages);
            });
            return;
        });
    }
}
