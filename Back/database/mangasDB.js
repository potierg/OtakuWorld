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

    getByName(search, callback) {
        this.getCollection(function(collection) {
            var reg = {'$or':[{'Nom': new RegExp(search)}, {"Nom Alternatif": new RegExp(search)}]};
           collection.find(reg).toArray(function (err, docs) {
                callback(docs);
            });
        });
    }

    getByAuteur(auteur, callback) {
        this.getCollection(function(collection) {
            collection.find({'Auteur': auteur}).toArray(function (err, docs) {
                callback(docs);
            });
        });
    }
}