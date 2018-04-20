'use strict';
var http = require('http');
var promise = require('promise');
const { exec } = require('child_process');

module.exports = class HtmlJapscanListMangas {
 
    constructor() {
        this.siteLink = "http://www.japscan.cc/mangas/";
    }

    getContentUrl() {
        var t = this;
        return new Promise(function(resolve, reject) {
            exec('curl -L ' + t.siteLink, (err, stdout, stderr) => {
                resolve(stdout);
            });
        });
    }

    getListChapters(nom, callback, nbTry = 0) {
        var t = this;
        this.getContentUrl().then(function(content) {
            if (content == "") {
                if (nbTry == 5) {
                    return callback({});
                }
                console.log("=+>ERROR", t.siteLink);
                return t.getListChapters(nom, callback, nbTry++);
            }

            var list = content.substring(content.indexOf("<div id=\"liste_chapitres\">"), content.indexOf("<div class=\"col-1-3\">"));
            list = list.split("\n");

            var index = 0;
            var tomes = [];
            
            while (index < list.length) {
                var line = list[index];

                if (line.indexOf("<h2>") !== -1) {
                    var val = line.substring(line.indexOf("<h2>") + 4, line.indexOf("</h2>"))
                    var number = 0;
                    if (val.match(/\d+/g))
                        number = val.match(/\d+/g).map(Number)[0];
                    tomes.push({nom:val.indexOf(":") !== -1 ? val.substring(val.indexOf(":") + 2) : null, nb:number, chapters:[]});
                }

                if (line.indexOf("<a href") !== -1) {
                    var val = line.substring(line.indexOf("\">") + 2, line.indexOf("</a>"));
                    var link = "http:"+line.substring(line.indexOf("<a href=\"") + 9, line.indexOf("\">"));
                    val = val.replace(nom, "");
                    var number = 0;
                    if (val.match(/\d+/g))
                        number = val.match(/\d+/g).map(Number)[0];

                    if (tomes.length == 0)
                        tomes.push({nom:null, nb:-1, chapters:[], isNoDetail: true});
                    var nom = val.indexOf(":") !== -1 ? val.substring(val.indexOf(":") + 2) : null;
                    tomes[tomes.length - 1].chapters.push({nom: nom, nb: number, link:link});
                    if (nom.indexOf("Attention: RAW") !== -1) {
                        tomes[tomes.length - 1].chapters[ tomes[tomes.length - 1].chapters.length - 1].flag = 'RAW';
                    }
                }
                if (line.indexOf("<span class=\"") !== -1) {
                    var flag = line.substring(line.indexOf("\">") + 2);
                    flag = flag.substring(0, flag.indexOf("</span>")).trim();
                    if (flag == "(VUS)" || flag == "(RAW)" || flag == "(SPOILER)")
                        tomes[tomes.length - 1].chapters[ tomes[tomes.length - 1].chapters.length - 1].flag = flag;
                }
                index++;
            }

            for (var key in tomes) {
                if (tomes[key].chapters.length == 1 && !tomes[key].isNoDetail) {
                    tomes[key].link = tomes[key].chapters[0].link;
                    delete tomes[key].chapters;
                }
                else {
                    tomes[key].chapters = tomes[key].chapters.reverse();
                }
            }

            if (tomes[0] && tomes[0].nb == -1)
                tomes[0].nb = tomes[1] ? tomes[1].nb + 1 : 1;

            tomes = tomes.reverse();                
            callback(tomes);
        });
    }

    run(link, nom, callback) {
        this.siteLink = link;
        this.getListChapters(nom, function(list) {
            callback(list);
        });
    }
}