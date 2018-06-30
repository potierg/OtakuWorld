'use strict';
var fs = require('fs'), request = require('request');

module.exports = class Manga {

    constructor() {
        this.downloadList = [];
    }

    addDownload(list, path, nomManga) {
        var id = Date.now();
        this.downloadList.push({id: id, scans: list.scans, status: false, size: list.size, done: list.done, path: path, nomManga: nomManga});
        return id;
    }

    addDownloadWithId(scans, idDl) {
        var array = this.getById(idDl);
        var nArrayConcat = array.scans.concat(scans);
        array.scans = nArrayConcat;
        array.size = nArrayConcat.length;
        this.setById(idDl, array);
    }

    getById(id) {
        for (var i = 0; i < this.downloadList.length; i++) {
            if (this.downloadList[i].id == id)
                return this.downloadList[i];
        }
        return null;
    }

    setById(id, array) {
        for (var i = 0; i < this.downloadList.length; i++) {
            if (this.downloadList[i].id == id)
                this.downloadList[i] = array;
        }
    }


    deleteById(id) {
        for (var i = 0; i < this.downloadList.length; i++) {
            if (this.downloadList[i].id == id)
                return this.downloadList.splice(i, 1);
        }
    }


    getPercentDoneById(id) {
        if (!this.getById(id))
            return -1;

        var percent = (this.getById(id).done / this.getById(id).size) * 100
        if (percent == 100)
            this.deleteById(id);

        return percent;
    }

    download(uri, dir, filename, callback){

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        request.head(uri, function(err, res, body){      
          request(uri).pipe(fs.createWriteStream(dir + '\\' + filename)).on('close', callback);
        });
      };

    downloadFile(id, i) {
        var th = this;
        var download = this.getById(id);
        if (download && i < download.scans.length && download.status) {

            download.nomManga = download.nomManga.replace('/', '-');
            if (!fs.existsSync(download.path + download.nomManga)){
                fs.mkdirSync(download.path + download.nomManga);
            }    

            download.scans[i].nomDir = download.path + download.nomManga + '\\' + download.scans[i].nomDir;
            // Download File

            th.download(download.scans[i].link, download.scans[i].nomDir, download.scans[i].nomFile, () => {
                th.getById(id).done++;
                setTimeout(function() {
                    th.downloadFile(id, i + 1);
                }, 100);
            });
        } else if (download){
            if (download.status == false)
                console.log("stop", id);
            else
                console.log("end", id);
            this.getById(id).status = false;
        }
    }

    async startDownload(id) {
        if (!this.getById(id))
            return -1;

        console.log("start", id);
        this.getById(id).status = true
        var th = this;

        this.downloadFile(id, this.getById(id).done);
    }

    stopDownload(id) {
        if (!this.getById(id))
            return -1;

        console.log("stop", id);
        this.getById(id).status = false
    }
}