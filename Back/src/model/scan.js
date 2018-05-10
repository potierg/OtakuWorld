'use strict';

var DB_NAME = "Scans";

module.exports = class Scan {
    
    constructor(mongo) {
        this.mongo = mongo;
    }

    getCollection() {
        var th = this;
        return new Promise(function(resolve, reject) {
            th.mongo.exec((db) => {
                const collection = db.collection(DB_NAME);
                resolve(collection);
            });
        });
    }

    async getByScanId(scanId) {

        var collection = await this.getCollection();

        return new Promise(function(resolve, reject) {
            collection.findOne({ '_id': new mongoId.ObjectId(scanId) }, function (err, docs) {
                resolve(docs);
            });
        });
    }

    async getScanWithIdAndNumero(mangaId, tome, chapter, callback) {

        var collection = await this.getCollection();
        
        return new Promise(function(resolve, reject) {

            collection.aggregate([
                { '$match': { '_id': new mongoId.ObjectId(mangaId) } },
                { '$unwind': '$scans' },
                { '$match': { 'scans.nb': Number.parseFloat(tome) } }
            ]).toArray(function (err, docs) {
                if (docs[0] && !docs[0].scans.chapters) {
                    return resolve({link:docs[0].link, scans: docs[0].scans});                    
                }
                collection.aggregate([
                    { '$match': { '_id': new mongoId.ObjectId(mangaId) } },
                    { '$unwind': '$scans' },
                    { '$unwind': '$scans.chapters' },
                    { '$match': { 'scans.chapters.nb': Number.parseFloat(chapter) } },
                ]).toArray(function (err, docs) {
                    if (docs[0])
                        return callback({link:docs[0].scans.chapters.link, scans: docs[0].scans.chapters});
                    return resolve({});
                });

            });
        });
    }
}