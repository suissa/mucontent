/* MODELS FOR BASE OPERATION
*/

var mongodb = require('mongodb');
var utils = require('../lib/utils');

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
				utils.quicklog(err.message);
			} else {
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

		collection.insert(value, function (err, objects) {
			if (err) {
				utils.quicklog(err.message);
			} else {
				callback(objects);
			}
			self.serverMongo.close();
		});
	});
};

ModelsBase.prototype.update = function (value, callback) {
	var self = this;
	this.db.open( function (error, client) {
		if (error) throw error;
		collection = new mongodb.Collection(client, 'information');
// with findandmodify we get back the modify object
		collection.findAndModify({type: value.type}, [['_id', 'asc']], {$set: {
			html: value.html 
			} }, {new:true}, function (err, objects) {
				if (err) {
					utils.quicklog(err.message);
				} else {
					callback(objects);
				}
				self.serverMongo.close();
		});
	});
};

module.exports = ModelsBase;
