'use strict';

var Mongo = require('./mongo');
var mongoId = require('mongodb');

module.exports = class MangasDB {

    constructor(mongo) {
        this.mongo = mongo;
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

    get(count = 25, page = 1, callback) {
        this.getCollection(function(collection) {
            collection.find({}).sort({Nom:1}).limit(count).skip(count * (page - 1)).toArray(function (err, docs) {
                collection.find({}).count(function(e, total) {
                    callback(docs, total);                    
                })
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

    getByName(count, page, search, callback) {
        this.getCollection(function(collection) {
            var reg = {'$or':[{'Nom': new RegExp(search)}, {"Nom Alternatif": new RegExp(search)}]};
           collection.find(reg).limit(count).skip(count * (page - 1)).toArray(function (err, docs) {
            collection.find(reg).count(function(e, total) {
                callback(docs, total);                    
            })
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