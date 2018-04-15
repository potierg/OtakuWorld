'use strict';
const MangaModel = require('../../Models/MangaModel');

const babyWorkers = require('baby-workers');
var promise = require('promise');

const HtmlJapscanListMangas = require('./html-Japscan-List-Mangas');
const HtmlJapscanDetailManga = require('./html-Japscan-Detail-Manga');

const htmlJapscanListMangas = new HtmlJapscanListMangas();
const htmlJapscanDetailManga = new HtmlJapscanDetailManga();

module.exports = class JapscanMangaParser {

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

    downloadMangaList(callback) {
        this.babyWorkers = new babyWorkers;
        console.log("Get Mangas List");

        var t = this;
        htmlJapscanListMangas.run(function(listMangas) {
            console.log("Done Start Download =>", listMangas.length);
            var mangaLength = listMangas.length;
            t.babyWorkers.create('listMangas', (worker, manga) => {
                t.getMangaInfos(manga).then(function() {
                    worker.pop();
                });

            }).map(listMangas).limit(50).run();

            t.babyWorkers.listMangas.complete(() => {
                callback();
                return;
            });
        });

        return ;
    }

    getMangaInfos(manga) {
        var t = this;
        return new Promise(function(resolve, reject) {

            t.mongo.getMangaByName(manga.nom, (info) => {
                var mdb = info;
                if (!mdb || !mdb.data || !mdb.data.japscan || mdb.data.japscan.last != manga.last) {
                    htmlJapscanDetailManga.runGetMangaInfos(manga.url, function(details) {
    
                        var savedManga = mdb;
                        if (!mdb)
                           savedManga= new MangaModel();
                        var id = 0;
    
                        savedManga.loadFromDB(mdb);
                        savedManga.Nom = savedManga.Nom != "" ? savedManga.Nom : manga.nom;
                        savedManga.pushUniqueGenre(manga.genre.trim());
                        savedManga.pushUniqueNomAlternatif(savedManga.Nom);
                        savedManga.pushUniqueNomAlternatif(manga.nom.toLowerCase());
    
                        savedManga.Synopsis.FR = details.synopsis.trim();
    
                        if (details["Nom Alternatif"])
                            details["Nom Alternatif"].toLowerCase().split(",").map(function (s) {
                                savedManga.pushUniqueNomAlternatif(s.trim());
                            });
    
                        if (details.Auteur) {
                            if (details.Auteur.indexOf(";") !== -1)
                                details.Auteur.toLowerCase().split(";").map(function (s) {
                                    savedManga.pushUniqueAuteur(s.trim());
                                });
                            else
                                details.Auteur.toLowerCase().split(",").map(function (s) {
                                    savedManga.pushUniqueAuteur(s.trim());
                                });
                        }
    
                        if (details["Sortie Initial"])
                            savedManga.SortieInitial = details["Sortie Initial"];
        
                        if (details.Statut)
                            savedManga.Statut = details.Statut;
                        
                        if (!savedManga.Cover.eden) {
                            var m = t.Eden.search(savedManga.Nom);
                            for (var i = 1; !m && i < savedManga.NomAlternatif.length; i++)
                                m = t.Eden.search(savedManga.NomAlternatif[i]);
    
                            if (m != null)
                                savedManga.Cover.push({from: "eden", img:m.cover});
                        }
    
                        var state = 0; // 0: jamais téléchargé | 1: à mettre à jour | 2 : en cours | 3: à jour
    
                        savedManga.data.japscan = { state: state, link: manga.url, last: manga.last };
                        savedManga.savedInDB(t.mongo, function () {
                            console.log('Pushed', manga.nom);
                            resolve();
                        });
                    });
                } else
                    resolve();
            });
        });
    }
}

