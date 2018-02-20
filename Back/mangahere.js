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
            var l = sniffer.search("div|[class=\"nopic_list clearfix\"]");
            var mangaList = this.getListAbc(l[2].next, []);
            mangaList = this.getListAbc(l[3].next, mangaList);

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

        mongo.getMangaByName(manga.nomEn, (info) => {
            var savedManga = null;
            var id = 0;
            if (info) {
                savedManga = info.manga;
                id = info._id;
            }

            sniffer.clean();
            sniffer.parseWithLink("http://" + manga.url, (htmlObject) => {

                var datas = sniffer.search("div|[class=\"manga_detail\"]");

                if (savedManga == null) {
                    savedManga = {
                        Nom: "",
                        Genre: [],
                        Statut: "",
                        Auteur: "",
                        'Nom Alternatif': [],
                        Synopsis: {},
                        Cover: {}
                    }
                }

                if (savedManga.Nom == "")
                    savedManga.Nom = decode(manga.nomEn);

                if (savedManga['Nom Alternatif'].indexOf(manga.nomEn) === -1)
                    savedManga['Nom Alternatif'].push(manga.nomEn);

                if (savedManga['Nom Alternatif'].indexOf(manga.nomEn.toLowerCase()) === -1)
                    savedManga['Nom Alternatif'].push(manga.nomEn.toLowerCase());

                if (datas[0] && datas[0].next[1].next[2].next[0].str)
                    decode(datas[0].next[1].next[2].next[0].str).toLowerCase().split(";").map(function (s) {
                        if (savedManga["Nom Alternatif"].indexOf(s.trim()) === -1)
                            savedManga["Nom Alternatif"].push(decode(s.trim()));
                    });

                if (datas[0].next[1].next[3].next[0].str)
                    decode(datas[0].next[1].next[3].next[0].str).toLowerCase().split(",").map(function (s) {
                        if (savedManga["Genre"].indexOf(s.trim()) === -1)
                            savedManga["Genre"].push(decode(s.trim()));
                    });

                savedManga["Statut"] = savedManga["Statut"] != "" ? savedManga["Statut"] : decode(datas[0].next[1].next[6].next[0].str).trim();
                if (datas[0].next[1].next[4].next[1])
                    savedManga["Auteur"] = savedManga["Auteur"] != "" ? savedManga["Auteur"] : decode(datas[0].next[1].next[4].next[1].value).trim();

                var c = decode(datas[0].next[0].content[0].trim().replace("src=\"", "").replace("\"", ""));

                savedManga["Cover"].mangahere = c;

                var l = sniffer.search("div|[class=\"detail_list\"]");

                if (l[0].next && l[0].next[0].str == "has been licensed, it is not available in MangaHere.") {
                    worker.pop();
                    return ;
                }

                /*if (!savedManga.Synopsis.EN)
                    savedManga.Synopsis.EN = sniffer.search("div|[id=\"readmangasum\"]")[1].value;*/

                var listManga = [];

                for (var k in l[1].next) {
                    var nl = {};
                    var li = l[1].next[k];
                    if (li.next && li.next[0] && li.next[0].next) {
                        if (li.next[0].next[0].value)
                            nl.numero = li.next[0].next[0].value.substring(manga.nomEn.length + 2).match(/\d+/g).map(Number)[0];

                        if (li.next[0].str)
                            nl.nomChap = li.next[0].str;

                        if (li.next[0].next[0].content[1])
                            nl.link = "http:" + li.next[0].next[0].content[1].trim().replace("href=\"", "").replace("\"", "");

                        if (li.next[1] && li.next[1].value) {
                            nl.date = li.next[1].value
                            if (nl.date == "new")
                                nl.date = new Date().toDateString();
                            else
                                nl.date = new Date(nl.date).toDateString();
                        }
                    }

                    listManga.push(nl);
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