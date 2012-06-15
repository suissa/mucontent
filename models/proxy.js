/* MuContent - MODELS FOR PROXY
        Author: Andrea Di Mario
        Version: 0.0.1
	Description: Manage the collection proxy for the sites collection
*/

// REQUIREMENTS
var mongodb = require('mongodb');
var utils = require('../lib/utils');
// IMPORT THE CONFIGURATION FILE
var Config = require('../config');

// CREATE A NEW CONFIGURATION INSTACE
var configuration = new Config();

var ModelsProxy = function() {
	this.database = 'proxy';
	this.serverMongo = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {auto_reconnect: true});
  	this.db = new mongodb.Db(this.database, this.serverMongo, {});
}

ModelsProxy.prototype.find = function(value, callback) {
	var self = this;
	this.db.open( function (error, client) {
		if (error) throw error;
		collection = new mongodb.Collection(client, 'sites');
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

ModelsProxy.prototype.update = function (find, value, callback) {
	var self = this;
	this.db.open( function (error, client) {
		if (error) throw error;
		collection = new mongodb.Collection(client, 'sites');
// with findandmodify we get back the modify object
		collection.findAndModify(find, [['_id', 'asc']], {$set: value }, {new:true}, function (err, objects) {
				if (err) {
					utils.quicklog(err.message);
				} else {
					callback(objects);
				}
				self.serverMongo.close();
		});
	});
};

ModelsProxy.prototype.remove = function (value, callback) {
        var self = this;
        this.db.open( function (error, client) {
                if (error) throw error;
                collection = new mongodb.Collection(client, 'sites');

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

module.exports = ModelsProxy;
