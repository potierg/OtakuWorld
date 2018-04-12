'use strict';
var http = require('http');

module.exports = class HtmlJapscanListMangas {
 
    constructor() {
        this.siteLink = "http://www.japscan.cc/mangas/";
    }

    getContentUrl (callback) {
        let content = "";
        http.get(this.siteLink, (resp) => {
            resp.setEncoding("utf8");
            resp.on("data", function (chunk) {
                content += chunk;
            });

            var t = this;
            resp.on("end", function () {
                content = content.replace("\n", "").replace("\r", "").replace(/\t/g, '');
                content = content.substring(content.indexOf("<html"));

                callback(content);
            });
        });
    }

    getMangaList (callback) {
        this.getContentUrl(function(content) {
            content = content.substring(content.indexOf("<div id=\"liste_mangas\" class=\"table\">"));
            content = content.split("\n");
            content = content.slice(7);

            var listMangas = [];
            var index = 0;
            var isStart = false;
            var row = 0;
            var currentManga = {};
            while (index < content.length) {
                var line = content[index];

                if (line == "</div>" && isStart) {
                    listMangas.push(currentManga);
                    isStart = false;
                }

                if (isStart) {
                    switch (row) {
                        case 0:
                            var url = line.replace("<div class=\"cell\"><a href=\"", "");
                            var nom = url.substring(url.indexOf("\">") + 2).replace("</a></div>", "")

                            if (nom.indexOf("<span") !== -1) {
                                var span = nom.substring(nom.indexOf("<span"), nom.indexOf("</span>") + 7);
                                nom = nom.replace(span, "l@ck");
                            }

                            currentManga.nom = nom;
                            currentManga.url = "http://www.japscan.cc"+url.substring(0, url.indexOf("\">"));
                            break;
                        case 1:
                            currentManga.genre = line.replace("<div class=\"cell\">", "").replace("</div>", "");
                        break;
                        case 2:
                            currentManga.statut = line.replace("<div class=\"cell\">", "").replace("</div>", "");
                        break;
                        case 3:
                            var last = line.replace("<div class=\"cell\"><a href=\"", "");
                            currentManga.last = last.substring(last.indexOf("\">", "") + 2).replace("</a></div>", "");
                        break;
                    }
                    row++;
                }

                if (line == "<div class=\"row\">") {
                    isStart = true;
                    row = 0;
                    currentManga = {};
                }
                index++;
            }
            callback(listMangas);
        });
    }

    run(callback) {
        this.getMangaList(function(listMangas) {
            callback(listMangas);
        })
    }
}