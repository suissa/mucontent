/* MODELS FOR USER
*/

var mongodb = require('mongodb');
var utils = require('../lib/utils');

var ModelsPost = function(database) {
	this.database = database;
	this.serverMongo = new mongodb.Server('127.0.0.1', 27017, {auto_reconnect: true});
  	this.db = new mongodb.Db(this.database, this.serverMongo, {});
}

ModelsPost.prototype.find = function(value, options, callback) {
	var self = this;
	this.db.open( function (error, client) {
		if (error) throw error;
		collection = new mongodb.Collection(client, 'posts');
		collection.find(value, options).toArray( function (err, objects) {
			if (err) {
				utils.quicklog(err.message);
			} else {
				callback(objects);
			}
			self.serverMongo.close();
		});
	});
};

ModelsPost.prototype.insert = function (value, callback) {
	var self = this;
	this.db.open( function (error, client) {
		if (error) throw error;
		collection = new mongodb.Collection(client, 'posts');
		collection.insert({
			title: value.title, 
			content: value.content, 
			slug: value.slug,
			date: value.date
			}, {safe: true}, function (err, objects) {
				if (err) {
					utils.quicklog(err.message);
				} else {
					callback(objects);
				}
			self.serverMongo.close();
		});
	});
};

ModelsPost.prototype.update = function (value, callback) {
	var self = this;
	this.db.open( function (error, client) {
		if (error) throw error;
		collection = new mongodb.Collection(client, 'posts');
		collection.findAndModify({_id: value.id}, [['_id', 'asc']], {$set: {
			title: value.title, 
			content: value.content, 
			} }, {new: true}, function (err, objects) {
				if (err) {
					utils.quicklog(err.message);
				} else {
					callback(objects);
				}
			self.serverMongo.close();
		});
	});
};

ModelsPost.prototype.uninstall = function (value, callback) {
	var self = this;
	this.db.open( function (error, client) {
		if (error) throw error;
		collection = new mongodb.Collection(client, 'information');

		collection.remove(value, function (err, objects) {
			if (err) {
				utils.quicklog(err.message);
			} else {
				callback(objects);
			}
			self.serverMongo.close();
		});
	});
};

ModelsPost.prototype.install = function (value, callback) {
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


module.exports = ModelsPost;
