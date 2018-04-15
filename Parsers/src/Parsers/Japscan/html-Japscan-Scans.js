'use strict';
var http = require('http');
var promise = require('promise');
const BabyWorkers = require('baby-workers');
const { exec } = require('child_process');

module.exports = class HtmlJapscanScans {
 
    constructor() {
        this.siteLink = "";
    }

    getContentUrl(link) {
        var t = this;
        return new Promise(function(resolve, reject) {
            exec('curl -L ' + link, (err, stdout, stderr) => {
                resolve(stdout);
            });
        });
    }

    reduceList(list) {
        if (!list || !list[0] || !list[list.length - 1])
            return {pages:list};
        var firstElement = list[0];
        var lastElement = list[list.length - 1];
        var index = 0;

        while (index < firstElement.length - 1 && index < lastElement.length - 1) {
            if (firstElement.substring(0, index) != lastElement.substring(0, index)) {
                index--;
                break;
            }
            index++;
        }

        var templateLink = firstElement.substring(0, index);

        var isOkForAll = true;
        var newList = [];

        list.forEach(link => {
            if (!link)
                return {pages:list};            
            if (link.indexOf(templateLink) === -1)
                isOkForAll = false;
            newList.push(link.replace(templateLink, ""));
        });

        if (isOkForAll) {
            return ({link:templateLink, pages:newList});
        }
        return ({pages:list});
    }

    downloadImageFromOnePage(link, callback) {
        var t = this;
        if (!link) {
            return callback(null);
        }
        this.getContentUrl(link).then(function(content) {

            if (content == "") {
                console.log("==> ERROR", link);
                return t.downloadImageFromOnePage(callback);
            }

            var linkImg = null;
            if (content.indexOf("<img data-img=\"") !== -1) {
                var img = content.substring(content.indexOf("<img data-img=\"") + 15);
                linkImg = img.substring(img.indexOf("src=\"") + 5, img.indexOf("\" />"));
            }
            callback(linkImg);
        });
        return ;
    }

    getScans(callback) {
        var t = this;
        this.getContentUrl(this.siteLink).then(function(content) {

            if (content == "") {
                console.log("=> ERROR", t.siteLink);
                return t.getScans(callback);
            }

            var linkTemplate = null;
            var isInOneDownload = false;
            var listLink = [];

            if (content.indexOf("<div id=\"images\">") !== -1) {

                isInOneDownload = true;

                var nom_manga = content.substring(content.indexOf("data-nom=\"") + 10);
                nom_manga = nom_manga.substring(0, nom_manga.indexOf("\" data-uri="))

                var chapitres = content.substring(content.indexOf("id=\"chapitres\" data-uri=\"") + 25);
                chapitres = chapitres.substring(0, chapitres.indexOf("\" ></select>"));

                if (content.indexOf("<div id=\"img1\" class=\"img\">") !== -1) {
                    var l = content.substring(content.indexOf("<img id=\"first_img\""));
                    l = l.substring(l.indexOf("src=\"") + 5, l.indexOf("\" />"));
                    linkTemplate = l.replace("/01.jpg", "") + '/';
                }
                else {
                    linkTemplate = "http://c.japscan.cc/cr_images/" + nom_manga.replace("/", "_").replace('?', '') + '/' + chapitres + '/';
                }
            }

            if (content.indexOf("<div data-link=\"") !== -1) {
                isInOneDownload = true;
                var nom_manga = content.substring(content.indexOf("data-nom=\"") + 10);
                nom_manga = nom_manga.substring(0, nom_manga.indexOf("\" data-uri="))

                var chapitres = content.substring(content.indexOf("id=\"chapitres\" data-uri=\"") + 25);
                chapitres = chapitres.substring(0, chapitres.indexOf("\" ></select>"));

                linkTemplate = "http://c.japscan.cc/cr_images/" + nom_manga.replace("/", "_").replace('?', '') + '/' + chapitres + '/';
            }

            var list = content.substring(content.indexOf("<select id=\"pages\" name=\"pages\">"));
            list = list.substring(0, list.indexOf("</select>"));
            list = list.split("\n");
    
            list.forEach(line => {
                line = line.trim();
                if (line.indexOf("<option") === 0 && line.indexOf("IMG") === -1) {
                    if (isInOneDownload) {
                        var page_uri = line.substring(line.indexOf("data-img=\"") + 10);
                        page_uri = page_uri.substring(0, page_uri.indexOf("\" value=\""));

                        listLink.push(linkTemplate + page_uri);
                    } else {
                        var page_url = line.substring(line.indexOf("value=\"") + 7);
                        page_url = page_url.substring(0, page_url.indexOf("\">"));

                        var oldNbPage = page_url.substring(page_url.lastIndexOf("/") + 1);
                        var newNbPage = oldNbPage[0] == '0' ? oldNbPage.substring(1) : oldNbPage;
                        page_url = page_url.replace(oldNbPage, newNbPage);
                        listLink.push("http://www.japscan.cc" + page_url);
                    }
                }
            });

            if (isInOneDownload)
                callback(t.reduceList(listLink));
            else {
                var babyWorkers = new BabyWorkers;
                var links = [];
                babyWorkers.create('getScans', (worker, url) => {
                    t.downloadImageFromOnePage(url, function(link) {
                        links.push(link);
                        worker.pop();
                    });
                }).map(listLink).limit(100).run();
    
                babyWorkers.getScans.complete(() => {
                    links = links.sort();
                    callback(t.reduceList(links));
                });
            }
            return ;            
        });
    }

    run(link, nom, callback) {
        this.siteLink = link;
        console.log(link);
        this.getScans(nom, function(list) {
            callback(list);
        });
    }
}