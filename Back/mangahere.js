'use strict';

const webSniffer = require('web-sniffer-js');
const httpClient = require('./httpClient');
const babyWorkers = require('baby-workers');

const client = new httpClient();
const sniffer = new webSniffer;

var decode = require('decode-html');

module.exports = class MangaHeres {

    constructor() {
    }

    getMangaList(mongo, callback) {
        this.babyWorkers = new babyWorkers;
        sniffer.clean();
        console.log("Recupération de la page list...");
        sniffer.parseWithLink("http://www.mangahere.cc/mangalist/", (htmlObject) => {
            console.log("Done");
            var l = sniffer.search("div|[class=\"nopic_list clearfix\"]");
            console.log("Récupération de la liste des mangas");
            var mangaList = this.getListAbc(l[2].next, []);
            mangaList = this.getListAbc(l[3].next, mangaList);
            console.log("Done -> " + mangaList.length + ' Téléchargé');
            console.log("Get One Manga");
            this.getOneManga(mongo, null, mangaList[0], (o) => {
                console.log("Done");
                callback(o);
            });
            return;
            var mangaLength = mangaList.length;
            this.babyWorkers.create('listMangas', (worker, manga) => {
                console.log('MangaReader - Manga pushed', parseInt(worker.getId()) + 1, '/', mangaLength, '-', Math.round((parseInt(worker.getId()) / mangaLength) * 100), '%');
                this.getOneManga(mongo, worker, manga);
            }, mangaList).limit(100).run(); // .stack();

            this.babyWorkers.listMangas.complete(() => {
                callback({});
            });

            return;
        });
    }

    getListAbc(content, mangaList) {
        for (var k in content) {
            var letter = content[k];
            for (var k2 in letter.next) {
                var info = letter.next[k2];
                if (info.name == "li" && info.next[0].content) {

                    var m = {};
                    m.nomEn = decode(info.next[0].content[1]).trim().replace("rel=\"", "").replace("\"", "");

                    if (info.next[0].content[2])
                        m.url = info.next[0].content[2].trim().replace("href=\"//", "").replace("\"", "");
                    mangaList.push(m);
                }
            }
        }
        return mangaList;
    }

    getOneManga(mongo, worker, manga, callback) {

        var isNew = true;

        mongo.getMangaByName('One Piece', (info) => {
            var savedManga = null;
            var id = 0;
            if (info) {
                savedManga = info.manga;
                id = info._id;
            }


            sniffer.clean();
            sniffer.parseWithLink("http://www.mangahere.cc/manga/one_piece/", (htmlObject) => {

                var datas = sniffer.search("div|[class=\"manga_detail\"]");


                if (savedManga == null) {
                    savedManga = {
                        Nom: "",
                        Genre: [],
                        'Nom Alternatif': [],
                        Synopsis: {},
                    }
                }

                if (savedManga.nom == "")
                    savedManga.Nom = manga.nomEn;
                manga.nomEn = "One Piece";

                if (savedManga['Nom Alternatif'].indexOf(manga.nomEn.toLowerCase()) === -1)
                    savedManga['Nom Alternatif'].push(manga.nomEn.toLowerCase());

                if (datas[0].next[1].next[2].next[0].str)
                    decode(datas[0].next[1].next[2].next[0].str).toLowerCase().split(";").map(function (s) {
                        if (savedManga["Nom Alternatif"].indexOf(s.trim()) === -1)
                            savedManga["Nom Alternatif"].push(decode(s.trim()));
                    });

                savedManga["Statut"] = savedManga["Statut"] != "" ? savedManga["Statut"] : decode(datas[0].next[1].next[6].next[0].str).trim();
                savedManga["Auteur"] = savedManga["Auteur"] != "" ? savedManga["Auteur"] : decode(datas[0].next[1].next[4].next[1].value).trim();
                savedManga["Cover"] = savedManga["Cover"] != "" ? savedManga["Cover"] : decode(datas[0].next[0].content[0].trim().replace("src=\"", "").replace("\"", ""));

                callback(savedManga);
                return;

                /*if (!savedManga.Synopsis.EN)
                    savedManga.Synopsis.EN = sniffer.search("div|[id=\"readmangasum\"]")[1].value;*/

                var listManga = [];
                var l = sniffer.search("table|[id=\"listing\"]");


                for (var k in l) {
                    if (k > 0) {
                        var nl = {};
                        if (l[k].next[0].next[1].value)
                            nl.numero = l[k].next[0].next[1].value.substring(manga.nomEn.length).match(/\d+/g).map(Number)[0];

                        if (l[k].next[0].next[1].content[0])
                            nl.link = "http://www.mangareader.net" + l[k].next[0].next[1].content[0].trim().replace("href=\"", "").replace("\"", "");

                        if (l[k].next[1].value)
                            nl.date = l[k].next[1].value

                        listManga.push(nl);
                    }
                }

                savedManga.MangaHere = listManga;

                mongo.deleteMangaById(id, () => {
                    mongo.addManga({ manga: savedManga }, () => {
                        worker.pop();
                    });
                })

            });
        });
    }
}