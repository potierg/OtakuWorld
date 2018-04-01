'use strict';

const MongoClient = require('mongodb').MongoClient;
var mongoId = require('mongodb');
const assert = require('assert');

const url = 'mongodb://164.132.106.118:27017';
const dbName = 'OtakuWorld';

module.exports = class Mongo {

    constructor() {
        this.db = null;
        this.client = null;
    }

    connect(callback) {
        MongoClient.connect(url, (err, client) => {
            assert.equal(null, err);
            this.db = client.db(dbName);
            console.log("Connected successfully to server");
            callback();
        });
    }

    disconnect() {
        this.client.close();
    }

    exec(callback) {
        try {
            callback(this.db);
        } catch (error) {
            console.log("ERROR MONGO", error);
        }
    }

    generateId(id) {
        return new mongoId.ObjectId(id);
    }
}
