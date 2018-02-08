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
        sniffer.parseWithLink("http://www.mangahere.cc/mangalist/", (htmlObject) => {
            var listHtml = sniffer.search("div|[class=\"list_manga\"]{0}");
            var mangaList = this.getListAbc(listHtml, [], (m) => {
                callback(m);
            });
            return;
            //mangaList = this.getListAbc(listHtml, mangaList, (m) => {
            //});

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

    getListAbc(content, mangaList, callback) {


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
        callback(mangaList);
        return mangaList;
    }

    getOneManga(mongo, worker, manga) {

        try {

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
                            Nom: "",
                            Genre: [],
                            'Nom Alternatif': [],
                            Synopsis: {},
                        }
                    }

                    if (savedManga.nom == "")
                        savedManga.Nom = manga.nomEn;
                    if (savedManga['Nom Alternatif'].indexOf(manga.nomEn.toLowerCase()) === -1)
                        savedManga['Nom Alternatif'].push(manga.nomEn.toLowerCase());


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
                        nt["Alternate Name"].toLowerCase().split(",").map(function (s) {
                            if (savedManga["Nom Alternatif"].indexOf(s.trim()) === -1)
                                savedManga["Nom Alternatif"].push(s.trim())
                        });
                    savedManga["Sortie Initial"] = nt["Year of Release"];
                    savedManga["Statut"] = nt["Status"];
                    savedManga["Auteur"] = nt["Author"];
                    savedManga["Cover"] = sniffer.search("div|[id=\"bodyust\"")[2].next[0].next[0].next[0].content[0].trim().replace("src=\"", "").replace("\"", "");

                    if (!savedManga.Synopsis.EN)
                        savedManga.Synopsis.EN = sniffer.search("div|[id=\"readmangasum\"]")[1].value;

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

                    savedManga.MangaReader = listManga;

                    mongo.deleteMangaById(id, () => {
                        mongo.addManga({ manga: savedManga }, () => {
                            worker.pop();
                        });
                    })

                });
            });

        } catch (error) {
            console.log("ERROR wait 5 sec and retry");
            setTimeout(this.getOneManga(mongo, worker, manga), 5000);
        }
    }
}