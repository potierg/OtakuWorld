'use strict';

const MongoClient = require('mongodb').MongoClient;
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
        callback(this.db);
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

    addManga(manga, cb) {
        console.log("Connect");
        this.exec((db) => {
            console.log("Done - Insert");
            const collection = db.collection('OtakuWorld');
            // Find some documents
            collection.insert(manga, cb);
            console.log("Done");
        })
    }

    getMangaByName(nom, callback) {
        nom = nom.toLowerCase();
        this.exec((db) => {
            const collection = db.collection('OtakuWorld');
            collection.find({'manga.Nom Alternatif':nom}).toArray(function(err, docs) {
                assert.equal(err, null);

                var manga = null;
                if (docs.length > 0)
                    manga = docs[0];

                callback(manga);
              });
        })
    }

    deleteMangaById(id, callback) {
        console.log("Connect");
        this.exec((db) => {
            console.log("Done - DELETE");
            const collection = db.collection('OtakuWorld');

            collection.deleteOne({"_id" : id});
            console.log("Done");
            callback();
        })
    }
}
