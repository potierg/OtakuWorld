'use strict';

var DB_NAME = "Mangas";

module.exports = class Manga {

    constructor(mongo) {
        this.mongo = mongo;
    }

    getCollection() {
        var th = this;
        return new Promise(function (resolve, reject) {
            th.mongo.exec((db) => {
                const collection = db.collection(DB_NAME);
                resolve(collection);
            });
        });
    }

    async get(count = 25, page = 1, callback) {
        var collection = await this.getCollection();

        return new Promise(function (resolve, reject) {
            collection.find({}).sort({ Nom: 1 }).limit(count).skip(count * (page - 1)).toArray(function (err, docs) {
                collection.find({}).count(function (e, total) {
                    resolve(docs, total);
                })
            });
        });
    }

    async getById(mangaId, callback) {
        var collection = await this.getCollection();

        return new Promise(function (resolve, reject) {
            collection.findOne({ '_id': new mongoId.ObjectId(mangaId) }, function (err, docs) {
                resolve(docs);
            });
        });
    }

    async getByName(count, page, search, callback) {
        var collection = await this.getCollection();

        return new Promise(function (resolve, reject) {
            var reg = { '$or': [{ 'Nom': new RegExp(search) }, { "Nom Alternatif": new RegExp(search) }] };
            collection.find(reg).limit(count).skip(count * (page - 1)).toArray(function (err, docs) {
                collection.find(reg).count(function (e, total) {
                    resolve(docs, total);
                })
            });
        });
    }

    async getByAuteur(auteur, callback) {
        var collection = await this.getCollection();

        return new Promise(function (resolve, reject) {
            collection.find({ 'Auteur': auteur }).toArray(function (err, docs) {
                resolve(docs);
            });
        });
    }
}