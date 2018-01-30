'use strict';

const httpClient = require('./httpClient');


const client = new httpClient();

module.exports = class ApiEden {

    constructor() {
        this.mangaList = null;
    }

    reset(callback) {
        client.get('http://www.mangaeden.com/api/list/0/', (ret_raw) => {
            this.mangaList = [];
            var ret = JSON.parse(ret_raw)['manga'];

            for (var keyOneManga in ret) {
                var oneM = ret[keyOneManga];
                this.mangaList.push({ id: oneM.i, title: oneM.t, genre: oneM.c, cover: (oneM.im != null ? 'http://cdn.mangaeden.com/mangasimg/200x/' + oneM.im : '') });
            }
            callback();
        });
    }

    search(titreManga) {
        for (var key in this.mangaList)
        {
            var manga = this.mangaList[key];
            if (manga.title.toUpperCase() == titreManga.toUpperCase())
                return manga;
        }
        return null;
    }

}