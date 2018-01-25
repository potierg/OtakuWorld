'use strict';

const webSniffer = require('web-sniffer-js');
const httpClient = require('./httpClient');


const client = new httpClient();
const sniffer = new webSniffer;

module.exports = class Japscan {

    constructor(){
        this.mangaList = null;
    }

    getMangaList(callback) {
        sniffer.parseWithLink("http://www.japscan.com/mangas/", (htmlObject) => {
            console.log(htmlObject);
        })
    }
}
