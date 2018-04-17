'use strict';

var Mongo = require('./mongo');
var mongoId = require('mongodb');

module.exports = class ScansDB {

    constructor(mongo) {
        this.mongo = mongo;
    }

    connect(callback) {
        this.mongo.connect(function () {
            callback();
        });
    }

    getCollection(callback) {
        this.mongo.exec((db) => {
            const collection = db.collection('Scans');
            callback(collection);
        });
    }

    getByScanId(scanId, callback) {
        this.getCollection(function (collection) {
            collection.findOne({ '_id': new mongoId.ObjectId(scanId) }, function (err, docs) {
                callback(docs);
            });
        });
    }

    getScanWithIdAndNumero(mangaId, tome, chapter, callback) {
        this.getCollection(function (collection) {

            collection.aggregate([
                { '$match': { '_id': new mongoId.ObjectId(mangaId) } },
                { '$unwind': '$scans' },
                { '$match': { 'scans.nb': Number.parseFloat(tome) } }
            ]).toArray(function (err, docs) {
                if (docs[0] && !docs[0].scans.chapters) {
                    return callback({link:docs[0].link, scans: docs[0].scans});                    
                }
                collection.aggregate([
                    { '$match': { '_id': new mongoId.ObjectId(mangaId) } },
                    { '$unwind': '$scans' },
                    { '$unwind': '$scans.chapters' },
                    { '$match': { 'scans.chapters.nb': Number.parseFloat(chapter) } },
                ]).toArray(function (err, docs) {
                    if (docs[0])
                        return callback({link:docs[0].scans.chapters.link, scans: docs[0].scans.chapters});
                    return callback({});
                });

            });
        });
    }
}