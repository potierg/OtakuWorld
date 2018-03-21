'use strict';

const MongoClient = require('mongodb').MongoClient;
var mongoId = require('mongodb');
const assert = require('assert');

// Connection URL
const url = 'mongodb://164.132.106.118:27017';

// Database Name
const dbName = 'OtakuWorld';

module.exports = class Mongo {

    constructor() {
        this.db = null;
        this.client = null;
    }

    connect(callback) {
        MongoClient.connect(url, (err, client) => {
            assert.equal(null, err);
            this.db = client.db(dbName);
            console.log("Connected successfully to server");
            callback();
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

    getAllMangas(callback) {
        this.exec((db) => {
            const collection = db.collection('OtakuWorld');
            // Find some documents
            collection.find({}).toArray(function (err, docs) {
                assert.equal(err, null);
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
                    deleteScansByMangaId(listScans.mangaId, () => {
                        collection.insert(listScans, (err, d) => {
                            return cb(d.ops[0]._id);
                        });
                    })
                } else {
                    collection.insert(listScans, (err, d) => {
                        return cb(d.ops[0]._id);
                    });
                }
            });
        })
    }

    deleteScansByMangaId(mangaId, callback) {
        this.exec((db) => {
            const collection = db.collection('Scans');

            collection.deleteOne({'mangaId': new mongoId.ObjectId(mangaId)});
            callback();
        })
    }

    addManga(manga, cb) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.insert(manga, cb);
        })
    }

    getMangaNotUpdate(callback) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.findOne({$or: [{'data.japscan.state': 0}, {'data.japscan.state': 3}]}, function (err, docs) {
                callback(docs);
            });
        });
    }

    getScanById(id, callback) {
        this.exec((db) => {
            const collection = db.collection('Scans');
            collection.findOne({'mangaId': new mongoId.ObjectId(id)}, function (err, docs) {
                callback(docs);
            });
        });
    }

    updateManga(manga, callback) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.update({ _id:  new mongoId.ObjectId(manga._id)}, manga, (err, res) => {
                return callback();
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
