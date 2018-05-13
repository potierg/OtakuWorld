'use strict';

module.exports = class MainDB {

    constructor(mongo, documentName) {
        this.mongo = mongo;
        this.documentName = documentName;
    }

    getCollection() {
        var db = this.mongo.getDb();
        const collection = db.collection(this.documentName);
        return collection;
    }

    findWithPagination(match, sort, count, page) {
        var th = this;
        return new Promise(function (resolve, reject) {
            th.getCollection().find(match).sort(sort).limit(count).skip(count * (page - 1)).toArray(function (err, docs) {
                th.getCollection().find({}).count(function(e, total) {
                    resolve({mangas: docs, total: total});
                });
            });
        });
    }

    find(match) {
        var th = this;
        return new Promise(function (resolve, reject) {
            th.getCollection().find(match).toArray(function (err, docs) {
                resolve(docs);
            });
        });
    }

    findOne(match) {
        var th = this;
        return new Promise(function (resolve, reject) {
            th.getCollection().findOne(match, function (err, docs) {
                resolve(docs);
            });
        });
    }

    insertOne(datas) {
        var th = this;
        return new Promise(function (resolve, reject) {
            th.getCollection().insertOne(datas, function (err, docs) {
                resolve(docs);
            });
        });
    }

    updateOne(match, set) {
        var th = this;
        return new Promise(function (resolve, reject) {
            th.getCollection().updateOne(match, {$set: set}, function (err, docs) {
                resolve(docs);
            });
        });
    }
}