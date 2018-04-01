'use strict';
const MangaModel = require('../../Models/MangaModel');

const babyWorkers = require('baby-workers');
const webSniffer = require('web-sniffer-js');
const { exec } = require('child_process');
var fs = require('fs');

module.exports = class JapscanParser {

    constructor() {
        this.siteLink = "http://www.japscan.cc";
        this.mongo = null;
    }

    setEden(eden) {
        this.Eden = eden;
    }

    setMongo(mongo) {
        this.mongo = mongo;
    }

    loadMangaList(callback) {
        this.babyWorkers = new babyWorkers;
        var sniffer = new webSniffer();
        console.log("Get Mangas List");
        sniffer.parseWithLink(this.siteLink + "/mangas/", (htmlObject) => {
            var listHtml = sniffer.search("div|[id=\"liste_mangas\"]");
            var mangaList = [];

            for (var elemHtmlKey in listHtml) {
                var elemHtml = listHtml[elemHtmlKey];
                if (elemHtml.content[0] !== "class=\"thead\"" && elemHtml.next[0].next[0].value != null) {
                    mangaList.push({
                        nomFR: elemHtml.next[0].next[0].value,
                        genre: elemHtml.next[1].value,
                        statut: elemHtml.next[2].value,
                        last: elemHtml.next[3].next[0].value,
                        url: this.siteLink + elemHtml.next[0].next[0].content[0].replace("href=\"", "").replace("\"", "")
                    });
                }
            }

            console.log("Done Start Download =>", mangaList.length);
            var mangaLength = mangaList.length;
            this.babyWorkers.create('listMangas', (worker, manga) => {
                if (manga.nomFR != 'Hajime No Ippo') // Exception revoir plus tard
                    this.getMangaInfos(worker, manga, (savedManga) => {
                        savedManga.savedInDB(this.mongo, () => {
                            worker.pop();
                        });
                    });
                else
                    worker.pop();
            }).map(mangaList).limit(100).run();


            this.babyWorkers.listMangas.complete(() => {
                callback(mangaList);
            });

            return;
        });
    }

    getMangaInfos(worker, manga, callback) {

        var sniffer = new webSniffer();

        this.mongo.getMangaByName(manga.nomFR, (info) => {
            var mdb = info;

            if (!mdb || !mdb.data || !mdb.data.japscan || mdb.data.japscan.last != manga.last) {
                console.log('Pushed', manga.nomFR);
                exec('curl ' + manga.url, (err, stdout, stderr) => {
                    sniffer.parseWithFile(stdout, (htmlObject) => {

                        var savedManga = new MangaModel();
                        var id = 0;

                        savedManga.loadFromDB(mdb);

                        savedManga.Nom = savedManga.Nom != "" ? savedManga.Nom : manga.nomFR;
                        savedManga.pushUniqueGenre(manga.genre.trim());
                        savedManga.pushUniqueNomAlternatif(savedManga.Nom);
                        savedManga.pushUniqueNomAlternatif(manga.nomFR.toLowerCase());
                        
                        var synopsisHtml = sniffer.search("div|[class=\"content\"]{0}");
                        if (synopsisHtml[3] && synopsisHtml[3].value && !savedManga.Synopsis.FR)
                            savedManga.Synopsis.FR = synopsisHtml[3].value.trim();

                        var tableHtml = sniffer.search("div|[class=\"table\"]");
                        var t = sniffer.formatTable(tableHtml);
                        for (var k in t[0]) {
                            if (k != 'Genre' && k != 'Terminé Le')
                                if (k == "Nom Alternatif") {
                                    t[0][k].toLowerCase().split(",").map(function (s) {
                                        savedManga.pushUniqueNomAlternatif(s.trim());
                                    });
                                }
                                else if (k == "Auteur") {
                                    if (t[0][k].indexOf(";") !== -1)
                                        t[0][k].toLowerCase().split(";").map(function (s) {
                                            savedManga.pushUniqueAuteur(s.trim());
                                        });
                                    else
                                        t[0][k].toLowerCase().split(",").map(function (s) {
                                            savedManga.pushUniqueAuteur(s.trim());
                                        });
                                }
                                else if (k == "Sortie Initial")
                                    savedManga.SortieInitial = t[0]['Sortie Initial'];
                                else if (k == "Genre")
                                    savedManga.Genre = t[0]['Genre'];
                                else if (k == "Statut")
                                    savedManga.Statut = t[0]['Statut'];
                        }

                        if (!savedManga.Cover.eden) {
                            var m = this.Eden.search(savedManga.Nom);
                            for (var i = 1; !m && i < savedManga.NomAlternatif.length; i++)
                                m = this.Eden.search(savedManga.NomAlternatif[i]);

                            if (m != null)
                                savedManga.Cover.eden = m.cover;
                        }

                        var state = 0; // 0: jamais téléchargé | 1: à mettre à jour | 2 : en cours | 3: à jour
                        if (savedManga.data.japscan && savedManga.data.scanId)
                            state = 3;

                        savedManga.data.japscan = { state: state, link: manga.url, last: manga.last };

                        callback(savedManga);
                    });
                });
            } else
                worker.pop();
        });
    }


}

