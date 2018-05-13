'use strict';

var mongoId = require('mongodb');
var MainDB = require('./mainDB');

module.exports = class MangasDB extends MainDB {

    constructor(mongo) {
        super(mongo, "Mangas");
    }

    async getById(id, callback) {
        callback(await this.findOne({ '_id': new mongoId.ObjectId(id) }));
    }

    getByIdAsync(id) {
        var th = this;
        return new Promise(async function (resolve, reject) {
            var i = await th.findOne({ '_id': new mongoId.ObjectId(id) });
            resolve(i);
        });
    }

    async get(count = 25, page = 1, callback) {
        callback(await this.findWithPagination({}, {Nom:1}, count, page));
    }

    async getByName(count, page, search, callback) {
        var reg = {'$or':[{'Nom': new RegExp(search)}, {"Nom Alternatif": new RegExp(search)}]};
        callback(await this.findWithPagination(reg, {}, count, page));
    }

    async getByAuteur(auteur, callback) {
        callback(await this.find({'Auteur': auteur}));
    }

    async getByIds(listIds, callback) {
        var obj_ids = listIds.map(function(id) { return new mongoId.ObjectId(id); });
        callback(await this.find({_id: {$in: obj_ids}}));
    }
}