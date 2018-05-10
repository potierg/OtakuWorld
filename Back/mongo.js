'use strict';

const MongoClient = require('mongodb').MongoClient;
var mongoId = require('mongodb');
const assert = require('assert');

const url = 'mongodb://193.70.91.62:27017';
const dbName = 'OtakuWorld';

module.exports = class Mongo {

    constructor() {
        this.db = null;
        this.client = null;
    }

    getDb() {
        return this.db;
    }

    connect(callback) {
        var t = this;
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url, (err, client) => {
                if (!client) {
                    console.log("Error connect to server "+url);
                    return resolve();
                }
                assert.equal(null, err);
                t.db = client.db(dbName);
                console.log("Connected successfully to server");
                resolve();
            });
        });
    }

    disconnect() {
        this.client.close();
    }

    generateId(id) {
        return new mongoId.ObjectId(id);
    }
}
