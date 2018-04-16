'use strict';

const httpClient = require('../httpClient');
var promise = require('promise');

const client = new httpClient();

module.exports = class ApiEden {

    constructor() {
        this.mangaList = null;
    }

    reset() {
        var t = this;
        return new Promise(function(resolve, reject) {
            client.get('http://www.mangaeden.com/api/list/0/', (ret_raw) => {
                t.mangaList = [];
                var ret = JSON.parse(ret_raw)['manga'];

                for (var keyOneManga in ret) {
                    var oneM = ret[keyOneManga];
                    t.mangaList.push({ id: oneM.i, title: oneM.t, genre: oneM.c, cover: (oneM.im != null ? 'http://cdn.mangaeden.com/mangasimg/200x/' + oneM.im : '') });
                }
                resolve();
            });
        });
    }

    search(titreManga) {
        for (var key in this.mangaList)
        {
            var manga = this.mangaList[key];
            if (titreManga && manga.title.toUpperCase() == titreManga.toUpperCase())
                return manga;
        }
        return null;
    }
}