'use strict';

module.exports = class Manga {

    constructor() {
        this.downloadList = [];
    }

    addDownload(list) {
        var id = Date.now();
        this.downloadList.push({id: id, scans: list.scans, status: false, size: list.size, done: list.done});
        return id;
    }

    getById(id) {
        for (var i = 0; i < this.downloadList.length; i++) {
            if (this.downloadList[i].id == id)
                return this.downloadList[i];
        }
        return null;
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

    downloadFile(id, i) {
        var th = this;
        if (this.getById(id) && i < this.getById(id).scans.length && this.getById(id).status) {
            console.log("Download", this.getById(id).scans[i]);
            this.getById(id).done++;
            setTimeout(function() {
                th.downloadFile(id, i + 1);
            }, 100);
        } else if (this.getById(id)){
            if (this.getById(id).status = false)
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