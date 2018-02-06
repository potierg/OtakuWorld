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
}


// Use connect method to connect to the server
MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    client.close();
});