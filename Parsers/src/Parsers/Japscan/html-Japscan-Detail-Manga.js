'use strict';
var http = require('http');

module.exports = class HtmlJapscanDetailManga {
 
    constructor() {
        this.siteLink = "";
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

    getMangaList(callback) {
        var t = this;
        this.getContentUrl(function(content) {
            if (content == "") {
                console.log("ERROR", t.siteLink);
                return t.getMangaList(callback);
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

            callback(infoObject);
        });
    }

    run(link, callback) {
        this.siteLink = link;
        this.getMangaList(function(detailManga) {
            callback(detailManga);
        })
    }
}