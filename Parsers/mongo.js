'use strict';

const MongoClient = require('mongodb').MongoClient;
var mongoId = require('mongodb');
const assert = require('assert');
var promise = require('promise');

const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const dbName = 'OtakuWorld';

module.exports = class Mongo {

    constructor() {
        this.db = null;
        this.client = null;
    }

    connect() {
        var t = this;
        return new Promise(function(resolve, reject) {
            MongoClient.connect(url, (err, client) => {
                assert.equal(null, err);
                t.db = client.db(dbName);
                console.log("Connected successfully to server");
                resolve();
            });
        });
    }

    disconnect() {
        this.client.close();
    }

    exec(callback) {
        try {
            callback(this.db);
        } catch (error) {
            console.log("ERROR MONGO");
        }
    }


    /// TO DISPATCH


    getAllMangas(callback) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            // Find some documents
            collection.find({}).toArray(function (err, docs) {
                callback(docs);
            });

        })
    }

    clearManga(cb) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.remove({});
        })        
    }

    updateScans(listScans, cb) {
        this.exec((db) => {
            const collection = db.collection('Scans');

            collection.findOne({'mangaId': new mongoId.ObjectId(listScans.mangaId)}, function (err, docs) {

                if (docs) {
                    collection.update({ mangaId:  new mongoId.ObjectId(listScans.mangaId)}, listScans, (err, d) => {
                        cb(docs._id);
                    });
                } else {
                    collection.insert(listScans, (err, d) => {
                        cb(d.ops[0]._id);
                    });
                }
            });
        });
    }

    deleteScansByMangaId(mangaId) {
        this.exec((db) => {
            const collection = db.collection('Scans');

            collection.deleteOne({'mangaId': new mongoId.ObjectId(mangaId)});
        })
    }

    getVoMangas(callback) {
        this.exec((db) => {
            const collection = db.collection('Mangas');

            collection.find({"data.japscan.state":3}).toArray(function (err, docs) {
                callback(docs);
            });
        });
    }

    addManga(manga, cb) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.insert(manga, cb);
        })
    }

    updateManga(id, manga, callback) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.update({ _id:  new mongoId.ObjectId(id)}, manga, (err, res) => {
                return callback();
            });
        });
    }

    getMangaCrashed(callback) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.find({'data.japscan.state': 1}).toArray(function (err, docs) {
                callback(docs);
            });
        });
    }

    getMangaNotUpdate(callback) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.findOne({$or: [{'data.japscan.state': 0}]}, function (err, docs) {
                callback(docs);
            });
        });
    }

    getScanById(id, callback) {
        if (!id)
            callback(null);
        else
            this.exec((db) => {
                const collection = db.collection('Scans');
                collection.findOne({'_id': new mongoId.ObjectId(id)}, function (err, docs) {
                    callback(docs);
                });
            });
    }

    getScansByScanNull(callback) {
        this.exec((db) => {
            const collection = db.collection('Scans');
            collection.find({'$or':[{'scans': null}, {'scans.chapters.pages': false}, {'scans.pages': false}]}).toArray(function (err, docs) {
                callback(docs);
            });
        });
    }

    getScansByScanVUS(callback) {
        this.exec((db) => {
            const collection = db.collection('Scans');
            collection.find({'$or':[{'scans.chapters.isUs': true}, {'scans.isUs': true}]}).toArray(function (err, docs) {
                callback(docs);
            });
        });
    }

    getMangaById(id, callback) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.findOne({ '_id': new mongoId.ObjectId(id) }, function (err, manga) {
                callback(manga);
            });
        });
    }

    getMangaByName(nom, callback) {
        nom = nom.toLowerCase();
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.findOne({ 'Nom Alternatif': nom }, function (err, manga) {
                callback(manga);
            });
        });
    }
}
