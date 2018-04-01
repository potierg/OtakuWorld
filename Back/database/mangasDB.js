'use strict';

var Mongo = require('./mongo');
var mongoId = require('mongodb');

module.exports = class MangasDB {

    constructor() {
        this.mongo = new Mongo();

    }

    connect(callback) {
        this.mongo.connect(function() {
            callback();
        });
    }

    getCollection(callback) {
        this.mongo.exec((db) => {
            const collection = db.collection('Mangas');
            callback(collection);
        });
    }

    get(callback) {
        this.getCollection(function(collection) {
            collection.find({}).toArray(function (err, docs) {
                callback(docs);
            });
        });
    }

    getById(mangaId, callback) {
        this.getCollection(function(collection) {
            collection.findOne({'_id':new mongoId.ObjectId(mangaId)}, function (err, docs) {
                callback(docs);
            });
        });
    }
}