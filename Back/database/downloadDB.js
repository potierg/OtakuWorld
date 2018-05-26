'use strict';

var mongoId = require('mongodb');
var MainDB = require('./mainDB');

module.exports = class DownloadDB extends MainDB {

    constructor(mongo) {
        super(mongo, "Download");
    }

    async getByUserId(userId, callback) {
        if (userId == -1) {
            callback();
            return ;
        }
        return callback(await this.find({'userId': new mongoId.ObjectId(userId)}));
    }

    async insertDownload(userId, mangaId, scans, callback) {
        if (userId == -1) {
            callback();
            return ;
        }
        return callback(await this.insertOne({mangaId:mangaId, userId:userId, scans:scans}));
    }
}