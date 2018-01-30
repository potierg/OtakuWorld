'use strict';

const webSniffer = require('web-sniffer-js');
const httpClient = require('./httpClient');


const client = new httpClient();
const sniffer = new webSniffer;

module.exports = class Japscan {

    constructor() {
        this.mangaList = null;
        this.edenList = null;
    }

    setEden(eden) {
        this.edenList = eden;
    }

    reset(callback) {
        var t = this;
        sniffer.clean();
        sniffer.parseWithLink("http://www.japscan.com/mangas/", function (htmlObject) {
            var listHtml = sniffer.search("div|[id=\"liste_mangas\"]");
            t.mangaList = [];
            var id = 0;
            for (var elemHtmlKey in listHtml) {
                var elemHtml = listHtml[elemHtmlKey];
                if (elemHtml.content[0] !== "class=\"thead\"" && elemHtml.next[0].next[0].value != null) {
                    var objM = { nom: elemHtml.next[0].next[0].value, url: "http://www.japscan.com" + elemHtml.next[0].next[0].content[0].replace("href=\"", "").replace("\"", "") }
                    var manga = t.edenList.search(objM.nom);
                    if (manga != null) {
                        objM.cover = manga.cover;
                    }
                    t.mangaList.push(objM);
                    id++;
                }
            }
            callback();
        });
    }

    getMangaList(page, count, callback) {
        callback(this.mangaList.slice(page * count, (count * (page + 1))));
    }

    searchManga(searchStr, callback) {
        if (this.mangaList != null) {
            var nList = [];
            for (var mangaId in this.mangaList) {
                var manga = this.mangaList[mangaId];

                var arrayName = searchStr.split(" ");
                var isMatch = true;

                for (var arrayNameKey in arrayName) {
                    if (manga.nom.toUpperCase().indexOf(arrayName[arrayNameKey].toUpperCase()) === -1)
                        isMatch = false;
                }

                if (isMatch && arrayName.length == manga.nom.split(' ').length)
                    nList.push(manga);
            }
            callback(nList);
        }
        else {
            var t = this;
            return (this.getMangaList(() => {
                return (t.searchManga(searchStr, callback));
            }));
        }
    }
}
