/* MODELS FOR BASE OPERATION
*/

var mongodb = require('mongodb');

var ModelsBase = function(database) {
	this.database = database;
	this.serverMongo = new mongodb.Server('127.0.0.1', 27017, {auto_reconnect: true});
  	this.db = new mongodb.Db(this.database, this.serverMongo, {});
}

ModelsBase.prototype.find = function(value, callback) {
	var self = this;
	this.db.open( function (error, client) {
		if (error) throw error;
		collection = new mongodb.Collection(client, 'information');
		collection.find(value).toArray( function (err, objects) {
			if (err) {
				console.log(err.message);
			} else {
//				console.log(objects);
				callback(objects);
			}
			self.serverMongo.close();
		});
	});
};

ModelsBase.prototype.insert = function (value, callback) {
	var self = this;
	this.db.open( function (error, client) {
		if (error) throw error;
		collection = new mongodb.Collection(client, 'information');

		collection.insert({layout: { path: value.path, record: value.record}}, function (err, objects) {
			if (err) {
				console.log(err.message);
			} else {
//				console.log(objects);
				callback(objects);
			}
			self.serverMongo.close();
		});
	});
};

module.exports = ModelsBase;
