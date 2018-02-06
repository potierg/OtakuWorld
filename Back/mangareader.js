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
            callback(htmlObject);
            return ;
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
    }
}