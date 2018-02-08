'use strict';

const webSniffer = require('web-sniffer-js');
const httpClient = require('./httpClient');
const babyWorkers = require('baby-workers');

const client = new httpClient();
const sniffer = new webSniffer;

module.exports = class MangaReader {

    constructor() {
        this.babyWorkers = new babyWorkers;
    }

    getMangaList(mongo, callback) {
        sniffer.clean();
        sniffer.parseWithLink("http://www.mangareader.net/alphabetical", (htmlObject) => {
            var listHtml = sniffer.search("div|[class=\"content_bloc2\"]");
            var mangaList = this.getListAbc(listHtml[2].next, []);
            mangaList = this.getListAbc(listHtml[3].next, mangaList);

            var mangaLength = mangaList.length;
            this.babyWorkers.create('listMangas', (worker, manga) => {
                console.log('Manga pushed', parseInt(worker.getId()) + 1, '/', mangaLength, '-', Math.round((parseInt(worker.getId()) / mangaLength) * 100), '%');
                this.getOneManga(mongo, worker, manga);
                return;
            }, mangaList).limit(50).run(); // .stack();

            return;
        });
    }

    getListAbc(content, mangaList) {

        for (var k in content) {
            var letter = content[k];
            if (letter.name == "div") {
                for (var k2 in letter.next[1].next) {
                    var info = letter.next[1].next[k2];
                    if (info.next[0].value) {
                        var m = {};
                        m.nomEn = info.next[0].value.trim();
                        if (info.next[1])
                            m.statut = info.next[1].value.replace("[", "").replace("]", "");
                        m.url = "http://www.mangareader.net" + info.next[0].content[0].trim().replace("href=\"", "").replace("\"", "");
                        mangaList.push(m);
                    }
                }
            }
        }
        return mangaList;
    }

    getOneManga(mongo, worker, manga) {

        var isNew = true;

        mongo.getMangaByName(manga.nomEn, (info) => {
            var savedManga = null;
            var id = 0;
            if (info) {
                savedManga = info.manga;
                id = info._id;
            }


            sniffer.clean();
            sniffer.parseWithLink(manga.url, (htmlObject) => {

                if (savedManga == null) {
                    savedManga = {
                        Genre: [],
                        'Nom Alternatif': [],
                        mangareader: [],
                    }
                }

                savedManga.nomEn = manga.nomEn;
                savedManga.nomEnLow = manga.nomEn.toLowerCase();


                let table = sniffer.search("div|[id=\"mangaproperties\"]")[1].next;

                var nt = {};
                var isg = false;
                for (var k in table) {
                    var val = table[k];

                    var nv = val.next[0].value;
                    nv = nv.substring(0, nv.length - 1);

                    if (val.next[1].next && val.next[1].next[0].value)
                        nt[nv] = val.next[1].next[0].value.trim();
                    else if (val.next[1] && val.next[1].value)
                        nt[nv] = val.next[1].value.trim();
                    else if (val.next[1].next && !isg) {
                        isg = true;
                        for (var k2 in val.next[1].next) {
                            var v2 = val.next[1].next[k2];

                            if (savedManga["Genre"].indexOf(v2.next[0].value))
                                savedManga["Genre"].push(v2.next[0].value);
                        }
                    }
                }

                if (nt["Alternate Name"])
                    savedManga["Nom Alternatif"] = nt["Alternate Name"].toLowerCase().split(",").map(function(s) { return s.trim() });
                savedManga["Sortie Initial"] = nt["Year of Release"];
                savedManga["Statut"] = nt["Status"];
                savedManga["Auteur"] = nt["Author"];

                savedManga.SynopsisEN = sniffer.search("div|[id=\"readmangasum\"]")[1].value;

                var listManga = [];
                var l = sniffer.search("table|[id=\"listing\"]");


                for (var k in l) {
                    if (k > 0) {
                        var nl = {};
                        if (l[k].next[0].next[1].value)
                            nl.numero = l[k].next[0].next[1].value.match(/\d+/g).map(Number)[0];

                        if (l[k].next[0].next[1].content[0])
                            nl.link = "http://www.mangareader.net" + l[k].next[0].next[1].content[0].trim().replace("href=\"", "").replace("\"", "");

                        if (l[k].next[1].value)
                            nl.date = l[k].next[1].value

                        listManga.push(nl);
                    }
                }

                savedManga.mangareader = listManga;

                mongo.deleteMangaById(id, () => {
                    mongo.addManga({ manga: savedManga }, () => {
                        worker.pop();
                    });
                })

            });
        });
    }
}