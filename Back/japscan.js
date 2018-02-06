'use strict';

const webSniffer = require('web-sniffer-js');
const httpClient = require('./httpClient');
const babyWorkers = require('baby-workers');

const client = new httpClient();
const sniffer = new webSniffer;

module.exports = class Japscan {

    constructor() {
        this.edenList = null;
        this.babyWorkers = new babyWorkers;
    }

    setEden(eden) {
        this.Eden = eden;
    }

    getMangaList(mongo, callback) {
        this.Eden.reset(() => {
            sniffer.clean();
            sniffer.parseWithLink("http://www.japscan.com/mangas/", (htmlObject) => {
                var listHtml = sniffer.search("div|[id=\"liste_mangas\"]");
                var mangaList = [];

                for (var elemHtmlKey in listHtml) {
                    var elemHtml = listHtml[elemHtmlKey];
                    if (elemHtml.content[0] !== "class=\"thead\"" && elemHtml.next[0].next[0].value != null) {
                        mangaList.push({
                            nomFR: elemHtml.next[0].next[0].value,
                            genre: [elemHtml.next[1].value],
                            statut: elemHtml.next[2].value,
                            url: "http://www.japscan.com" + elemHtml.next[0].next[0].content[0].replace("href=\"", "").replace("\"", ""),
                        });
                    }
                }

                var mangaLength = mangaList.length;
                this.babyWorkers.create('listMangas', (worker, manga) => {
                    console.log('\bManga pushed', parseInt(worker.getId()) + 1, '/', mangaLength, '-', Math.round((parseInt(worker.getId()) / mangaLength) * 100), '%');
                    this.getOneManga(mongo, worker, manga);
                }, mangaList).limit(50).run(); // .stack();

                callback({});
            });
        });
    }

    getOneManga(mongo, worker, manga) {
        sniffer.clean();
        sniffer.parseWithLink(manga.url, (htmlObject) => {

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
                        currentTome.nomTomeFR = info.substring(pos + 1).trim();
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
                            chapter.nomChapFR = chap.value.substring(pos + 1).trim();
                            nb = chap.value.substring(0, pos - 1).trim();
                        } else if (info)
                            nb = info.trim();

                        if (nb && nb.match(/\d+/g))
                            chapter.numero = nb.match(/\d+/g).map(Number)[0];
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

            var synopsisHtml = sniffer.search("div|[class=\"content\"]{0}");
            if (synopsisHtml[3] && synopsisHtml[3].value)
                manga.synopsisFR = synopsisHtml[3].value.trim();

            var tableHtml = sniffer.search("div|[class=\"table\"]");
            var t = sniffer.formatTable(tableHtml);
            for (var k in t[0]) {
                if (k != 'Genre')
                    manga[k] = t[0][k];
            }
            manga.listTome = listTome;

            var m = this.Eden.search(manga.nom);
            if (!m)
                m = this.Eden.search(manga['Nom Alternatif']);

            if (m != null)
                manga.cover = m.cover;

            delete (manga.url);
            mongo.addManga({ manga: manga }, () => {
                worker.pop();
            });
        });
    }
}
