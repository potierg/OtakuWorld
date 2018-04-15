'use strict';
var http = require('http');
var promise = require('promise');

module.exports = class HtmlJapscanDetailManga {
 
    constructor() {
        this.siteLink = "";
    }

    getContentUrl() {
        var t = this;
        var content = "";
        return new Promise(function(resolve, reject) {

            http.get(t.siteLink, function (response) {
                response.setEncoding("utf8");
                response.on("data", function (chunk) {
                    content += chunk;
                });

                response.on("end", function () {
                    content = content.replace("\n", "").replace("\r", "").replace(/\t/g, '');
                    content = content.substring(content.indexOf("<html"));
                    resolve(content);
                });
            });
        });
    }

    getMangaInfos(callback) {
        var t = this;
        this.getContentUrl().then(function(content) {
            if (content == "") {
                console.log("ERROR", t.siteLink);
                return t.getMangaInfos(callback);
            }

            var table = content.substring(content.indexOf("<div class=\"table\">"));
            table = table.substring(0, table.indexOf("</div>\n<h2 class=\"bg-header\">Synopsis</h2>"));
            table = table.split("\n");


            table = table.slice(2);

            var index = 0;
            var infos = [];
            var indexInfos = 0;
            var passToInfos = false;

            while (index < table.length) {
                var line = table[index];
                if (line.indexOf("<div class=\"cell\">") == 0) {
                    var head = line.replace("<div class=\"cell\">", "");
                    if (head.indexOf("<a target=") == 0)
                    {
                        head = head.substring(head.indexOf("\">") + 2);
                        head = head.replace("</a>", "");
                    }
                    head = head.replace("</div>", "");
                    if (passToInfos)
                        infos[(indexInfos - infos.length)].value = head;
                    else
                        infos.push({header : head.replace("</div>", ""), value:""});

                    indexInfos++;
                }
                if (line.indexOf("</div>") == 0)
                    passToInfos = true;
                index++;
            }

            var infoObject = {};
            for (var key in infos) {
                infoObject[infos[key].header] = infos[key].value;
            }

            // SYNOPSIS

            content = content.substring(content.indexOf("<div id=\"synopsis\">"));
            content = content.split("\n");
            infoObject.synopsis = content[1].replace("</div>", "");

            callback(infoObject);
        });
    }

    runGetMangaInfos(link, callback) {
        this.siteLink = link;
        this.getMangaInfos(function(detailManga) {
            callback(detailManga);
        })
    }
}