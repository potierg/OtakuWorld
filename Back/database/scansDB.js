'use strict';

var Mongo = require('./mongo');
var mongoId = require('mongodb');

module.exports = class ScansDB {

    constructor() {
        this.mongo = new Mongo();
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

    getByMangaId(mangaId, callback) {
        console.log({ 'mangaId': new mongoId.ObjectId(mangaId) });
        this.getCollection(function (collection) {
            collection.findOne({ 'mangaId': new mongoId.ObjectId(mangaId) }, function (err, docs) {
                callback(docs);
            });
        });
    }

    getScanWithIdAndNumero(mangaId, numero, callback) {
        this.getCollection(function (collection) {

            collection.aggregate([
                { '$match': { 'mangaId': new mongoId.ObjectId(mangaId) } },
                { '$unwind': '$scans' },
                { '$match': { 'scans.numero': Number.parseFloat(numero) } }
            ]).toArray(function (err, docs) {
                if (docs[0])
                    return callback(docs[0].scans);

                collection.aggregate([
                    { '$match': { 'mangaId': new mongoId.ObjectId(mangaId) } },
                    { '$unwind': '$scans' },
                    { '$unwind': '$scans.chapters' },
                    { '$match': { 'scans.chapters.numero': Number.parseFloat(numero) } },
                ]).toArray(function (err, docs) {
                    if (docs[0])
                        return callback(docs[0].scans.chapters);
                    return callback({});
                });

            });
        });
    }
}