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

    addScans(listScans, cb) {
        this.exec((db) => {
            const collection = db.collection('Scans');
            collection.insert(listScans, (err, d) => {
                cb(d.ops[0]._id);
            });
        })
    }

    addManga(manga, cb) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.insert(manga, cb);
        })
    }

    addChapter(chapter, cb) {
        this.exec((db) => {
            const collection = db.collection('Chapters');
            collection.insert(chapter, cb);
        })
    }

    getMangaNotDownload(callback) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.findOne({ 'data.japscan.state': 0 }, function (err, docs) {
                callback(docs);
            });
        });
    }

    updateManga(manga, callback) {
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.update({ _id:  new mongoId.ObjectId(manga._id)}, manga, (err, res) => {
                callback();
            });
        });
    }

    getMangaByName(nom, callback) {
        nom = nom.toLowerCase();
        this.exec((db) => {
            const collection = db.collection('Mangas');
            collection.find({ 'Nom Alternatif': nom }).toArray(function (err, docs) {
                assert.equal(err, null);

                var manga = null;
                if (docs.length > 0)
                    manga = docs[0];

                callback(manga);
            });
        })
    }

    deleteMangaById(id, callback) {
        this.exec((db) => {
            const collection = db.collection('OtakuWorld');

            collection.deleteOne({ "_id": id });
            callback();
        })
    }
}
