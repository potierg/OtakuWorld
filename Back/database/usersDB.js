'use strict';

var mongoId = require('mongodb');
var MainDB = require('./mainDB');

module.exports = class UsersDB extends MainDB {

    constructor(mongo) {
        super(mongo, "Users");
    }

    async getById(id, callback) {
        callback(await this.findOne({ '_id': new mongoId.ObjectId(id) }));
    }

    async updateFavorite(userId, mangaId, callback) {
        var user = await this.findOne({ '_id': new mongoId.ObjectId(userId) });

        var pos = user.favorite.indexOf(mangaId);
        if (pos === -1) {
            user.favorite.push(mangaId);
        } else {
            user.favorite.splice(pos, 1);
        }
        callback(await this.updateOne({'_id':new mongoId.ObjectId(userId)}, {favorite:user.favorite}));
    }

    isMangaFavorite(userId, mangaId) {
        var th = this;
        return new Promise(async function (resolve, reject) {
            if (userId == -1)
                return resolve(false);

            var user = await th.findOne({ '_id': new mongoId.ObjectId(userId) });
            var pos = user.favorite.indexOf(mangaId);
            if (pos === -1) {
                return resolve(false);
            }
            resolve (true);
        });
    }
}