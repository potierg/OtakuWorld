'use strict';

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://164.132.106.118:27017';

// Database Name
const dbName = 'OtakuWorld';

module.exports = class Mongo {

    exec(callback) {
        MongoClient.connect(url, function (err, client) {
            assert.equal(null, err);
            const db = client.db(dbName);
            callback(db);

            client.close();
        });
    }

    getAllMangas(callback) {
        this.exec((db) => {
            const collection = db.collection('OtakuWorld');
            // Find some documents
            collection.find({}).toArray(function (err, docs) {
                assert.equal(err, null);
                console.log("Found the following records");
                callback(docs);
            });

        })
    }

    addManga(manga, cb) {
        this.exec((db) => {
            const collection = db.collection('OtakuWorld');
            // Find some documents
            collection.insert(manga, cb);
        })
    }

    getMangaByName(nom, callback) {
        nom = nom.toLowerCase();
        this.exec((db) => {
            const collection = db.collection('OtakuWorld');
            collection.find({$or:[ {'manga.Nom Alternatif':nom}, {'manga.NomFRLow':nom}] }).toArray(function(err, docs) {
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

            collection.deleteOne({"_id" : id});
            callback();
        })
    }
}


// Use connect method to connect to the server
MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    client.close();
});