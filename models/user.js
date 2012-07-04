/* MuContent - MODELS FOR USER
*/

var mongodb = require('mongodb');
var utils = require('../lib/utils');
var Config = require('../config');

var configuration = new Config();

var ModelsUser = function(database) {
	this.database = database;
	this.serverMongo = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {auto_reconnect: true});
  	this.db = new mongodb.Db(this.database, this.serverMongo, {});
}

ModelsUser.prototype.find = function(value, callback) {
	var self = this;
	this.db.open( function (error, client) {
		if (error) throw error;
		collection = new mongodb.Collection(client, 'user');
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

ModelsUser.prototype.insert = function (value, callback) {
	var self = this;
	this.db.open( function (error, client) {
		if (error) throw error;
		collection = new mongodb.Collection(client, 'user');
		

		collection.insert(value, {safe: true}, function (err, objects) {
				if (err) {
					utils.quicklog(err.message);
				} else {
					callback(objects);
				}
				self.serverMongo.close();
		});
	});
};

ModelsUser.prototype.update = function (find, value, callback) {
	var self = this;
	this.db.open( function (error, client) {
		if (error) throw error;
		collection = new mongodb.Collection(client, 'user');
// with findandmodify we get back the modify object
		collection.findAndModify(find, [['_id', 'asc']], {$set: value}, {new:true}, function (err, objects) {
				if (err) {
					utils.quicklog(err.message);
				} else {
					callback(objects);
				}
				self.serverMongo.close();
		});
	});
};

ModelsUser.prototype.remove = function (value, callback) {
        var self = this;
        this.db.open( function (error, client) {
                if (error) throw error;
                collection = new mongodb.Collection(client, 'user');

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


module.exports = ModelsUser;
