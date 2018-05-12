'use strict';

var mongoId = require('mongodb');
var MainDB = require('./mainDB');

module.exports = class ScansDB extends MainDB {

    constructor(mongo) {
        super(mongo, "Scans");
    }

    async getByScanId(scanId, callback) {
        callback(await this.findOne({ '_id': new mongoId.ObjectId(scanId)}));
    }

    getScanWithIdAndNumero(mangaId, tome, chapter, callback) {
        this.getCollection().aggregate([
            { '$match': { '_id': new mongoId.ObjectId(mangaId) } },
            { '$unwind': '$scans' },
            { '$match': { 'scans.nb': Number.parseFloat(tome) } }
        ]).toArray(function (err, docs) {
            if (docs[0] && !docs[0].scans.chapters) {
                return callback({ link: docs[0].link, scans: docs[0].scans });
            }
            collection.aggregate([
                { '$match': { '_id': new mongoId.ObjectId(mangaId) } },
                { '$unwind': '$scans' },
                { '$unwind': '$scans.chapters' },
                { '$match': { 'scans.chapters.nb': Number.parseFloat(chapter) } },
            ]).toArray(function (err, docs) {
                if (docs[0])
                    return callback({ link: docs[0].scans.chapters.link, scans: docs[0].scans.chapters });
                return callback({});
            });
        });
    }

    getScanByTomeAndChapter(scans, nbTome, nbChapter) {
        var scanInfos = {};
        for (var keyTome in scans) {
            if (scans[keyTome].nb === nbTome) {
                scanInfos.nbTome = nbTome;
                scanInfos.nomTome = scans[keyTome].nom;
            
                if (nbChapter !== -1) {
                    for (var keyChapter in scans[keyTome].chapters) {
                       if (scans[keyTome].chapters[keyChapter].nb === nbChapter) {
                            scanInfos.nbChapter = nbChapter;
                            scanInfos.nomChapter = scans[keyTome].chapters[keyChapter].nomChap;
                            scanInfos.links = [];

                            if (scans[keyTome].chapters[keyChapter].pages) {
                                scans[keyTome].chapters[keyChapter].pages.forEach(page => {
                                    scanInfos.links.push(scans[keyTome].chapters[keyChapter].link+page);
                                });
                            } else {
                                console.log(nbTome, nbChapter);
                            }

                            return scanInfos;
                       }
                    }
                } else {
                    scanInfos.links = [];
                    
                    scans[keyTome].pages.forEach(page => {
                        scanInfos.links.push(scans[keyTome].link+page);
                    });
                    
                    scanInfos.links;
                    return scanInfos;                        
                }
            }
        }
    }

    async getScansByNumeros(scanId, numeros, callback) {
        var scanDatas = await this.findOne({ '_id': new mongoId.ObjectId(scanId) });
        var scansArray = [];

        numeros = numeros.reverse();

        numeros.forEach(element => {
            var scans = this.getScanByTomeAndChapter(scanDatas.scans, element.tome, element.chapter);

            var page = 0;
            scans.links.forEach(link => {
                if (link) {
                    var ext = link.substring(link.lastIndexOf("."));
                    scansArray.push({nomDir:"Tome "+scans.nbTome+(scans.nomTome ? " : "+scans.nomTome : ""),
                    nomFile :(scans.nbChapter ? "chap"+scans.nbChapter : '')+"page"+page+ext, link:link});
                    page++;    
                } else {
                    console.log(scans, page);
                }
            });
        });
        callback(scansArray);
    }
}