/* MuContent - MODELS FOR SKEL EXAMPLE
        Author: Andrea Di Mario
        Version: 0.0.0
	Description: The Skel controller's model (ONLY INSERT INFORMATION FOR PLUGIN IS SET)
*/

// REQUIREMENTS
var mongodb = require('mongodb');
var utils = require('../lib/utils');
// IMPORT THE CONFIGURATION FILE
var Config = require('../config');

// CREATE A NEW CONFIGURATION INSTACE
var configuration = new Config();

var ModelsSkel = function(database) {
	this.database = database;
	this.serverMongo = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {auto_reconnect: true});
  	this.db = new mongodb.Db(this.database, this.serverMongo, {});
}

ModelsSkel.prototype.install = function (value, callback) {
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

ModelsSkel.prototype.uninstall = function (value, callback) {
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

module.exports = ModelsSkel;
