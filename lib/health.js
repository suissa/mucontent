/* MuContent - HEALTH CHECK
*/

// REQUIREMENTS
var http = require('http');
var utils = require('../lib/utils');
var mongodb = require('mongodb');
var cache = require('../lib/cache');
var Config = require('../config');
var os = require('os');

// CONFIGURATION INSTANCE
var configuration = new Config();

function check () {
// get client list from cache and for each do this:
	var appserver_list = cache.get('appserver_list');
	appserver_list.forEach( function(client) {
		var options = {
			host: client,
			port: 8080,
			method: 'GET',
			path: '/status'
		}

		var request = http.request(options, function (res) {
			utils.quicklog("AppServer " + options.host + " status: " + res.statusCode);
		});
		request.on('error', function(error) {
			utils.quicklog("Health check refused by AppServer " + options.host);
// remove from appserver list
			appserver_list.splice(appserver_list.indexOf(options.host),1);
			cache.put('appserver_list', appserver_list);
// remove from database
			var serverMongo = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {});
			new mongodb.Db('proxy', serverMongo, {}).open(function (error, client) {
	  			if (error) {
					utils.quicklog(error);
				}
	  			var collection = new mongodb.Collection(client, 'appserver');
	  			collection.remove({ip: options.host}, {safe:true}, function(err, docs) {
					utils.quicklog("Removed client " + options.host);
					serverMongo.close();
				});
			});	
		});
		request.end();

	});
}

function domain_mapping(callback) {
	var serverMongo = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {});
	new mongodb.Db('proxy', serverMongo, {}).open(function (error, client) {
  		if (error) {
			utils.quicklog(error);
		}
  		var collection = new mongodb.Collection(client, 'sites');
  		collection.find().toArray(function(err, docs) {
			callback(docs);
			serverMongo.close();
		});
	});	
}

function information_mapping(database, callback) {
	var serverMongo = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {});
	new mongodb.Db(database, serverMongo, {}).open(function (error, client) {
  		if (error) {
			utils.quicklog(error);
		}
  		var collection = new mongodb.Collection(client, 'information');
  		collection.find().toArray(function(err, docs) {
			callback(docs);
			serverMongo.close();
		});
	});	
}

function language_mapping(database, callback) {
	var serverMongo = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {});
	new mongodb.Db(database, serverMongo, {}).open(function (error, client) {
  		if (error) {
			utils.quicklog(error);
		}
  		var collection = new mongodb.Collection(client, 'content');
  		collection.find().toArray(function(err, docs) {
			callback(docs);
			serverMongo.close();
		});
	});	
}

function appserver_mapping(callback) {
	var serverMongo = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {});
	new mongodb.Db('proxy', serverMongo, {}).open(function (error, client) {
  		if (error) {
			utils.quicklog(error);
		}
  		var collection = new mongodb.Collection(client, 'appserver');
  		collection.find().toArray(function(err, docs) {
			var results = [];
			docs.forEach( function (row) {
				results.push(row.ip)
			});
			callback(results);
			serverMongo.close();
		});
	});	
}

function get_interface(callback) {
	var ifaces = os.networkInterfaces();
	for (var dev in ifaces) {
		var alias=0;
 		ifaces[dev].forEach(function(details){
    			if (details.family === configuration.Params.ip_protocol) {
				if (dev === configuration.Params.listen_client_interface) {
					utils.quicklog('Set the client interface');
					callback(details.address);
				}
				++alias;
			}
  		});
	}
}



function add_appserver() {
	get_interface(function (interface) {
		var serverMongo = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {});
		new mongodb.Db('proxy', serverMongo, {}).open(function (error, client) {
  			if (error) {
				utils.quicklog(error);
			}
	  		var collection = new mongodb.Collection(client, 'appserver');
			// upsert because insert add a lot of same ip
	  		collection.update({ip: interface}, {$set: {ip: interface} }, {upsert:true}, function(err) {
				if (err) utils.quicklog("Error AppServer added: ", err.message);
				else utils.quicklog("Added AppServer " + interface);
				serverMongo.close();
			});
		});	

	});
}


exports.check = check;
exports.domain_mapping = domain_mapping;
exports.information_mapping = information_mapping;
exports.language_mapping = language_mapping;
exports.appserver_mapping = appserver_mapping;
exports.get_interface = get_interface;
exports.add_appserver = add_appserver;
