/* MY HEALTH CHECK
	- FOR CHECK USE HTTP REQUEST TO A PAGE STATUS OR http://nodejs.org/api/net.html#net_net_createconnection_arguments LIKE https://github.com/bigodines/nodejs-heartbeat/blob/master/src/heartbeat.js

*/

var http = require('http');
var utils = require('../lib/utils');
var mongodb = require('mongodb');
var cache = require('../lib/cache');
var os = require('os');
var exec = require('child_process').exec;

function check () {
// get client list from cache and for each do this:
	var client_list = cache.get('client_list');
	client_list.forEach( function(client) {
		var options = {
			host: client,
			port: 8080,
			method: 'GET',
			path: '/status'
		}

		var request = http.request(options, function (res) {
			utils.quicklog("Client " + options.host + " status: " + res.statusCode);
		});
		request.on('error', function(error) {
			utils.quicklog("Health check refused by client" + options.host);
// remove from client list
			client_list.splice(client_list.indexOf(options.host),1);
			cache.put('client_list', client_list);
// remove from database
			var serverMongo = new mongodb.Server("127.0.0.1", 27017, {});
			new mongodb.Db('proxy', serverMongo, {}).open(function (error, client) {
	  			if (error) throw error;
	  			var collection = new mongodb.Collection(client, 'client');
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
	var serverMongo = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db('proxy', serverMongo, {}).open(function (error, client) {
  		if (error) throw error;
  		var collection = new mongodb.Collection(client, 'sites');
  		collection.find().toArray(function(err, docs) {
			callback(docs);
			serverMongo.close();
		});
	});	
}

function information_mapping(database, callback) {
	var serverMongo = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db(database, serverMongo, {}).open(function (error, client) {
  		if (error) throw error;
  		var collection = new mongodb.Collection(client, 'information');
  		collection.find().toArray(function(err, docs) {
			callback(docs);
			serverMongo.close();
		});
	});	
}

function language_mapping(database, callback) {
	var serverMongo = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db(database, serverMongo, {}).open(function (error, client) {
  		if (error) throw error;
  		var collection = new mongodb.Collection(client, 'content');
  		collection.find().toArray(function(err, docs) {
			callback(docs);
			serverMongo.close();
		});
	});	
}

function client_mapping(callback) {
	var serverMongo = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db('proxy', serverMongo, {}).open(function (error, client) {
  		if (error) throw error;
  		var collection = new mongodb.Collection(client, 'client');
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
	exec("ps aux | grep app.js | wc -l", function (error, stdout, stderr) {
		var ifaces = os.networkInterfaces();
		for (var dev in ifaces) {
  			var alias=0;
  			ifaces[dev].forEach(function(details){
    				if (details.family === 'IPv4') {
				// if stdout have different inteface, else there aren't them
					if (stdout > 3) {
						if (dev === "lo") {
							callback(details.address);
						}
					} else {
						if (dev === "eth1") { 
							callback(details.address);
						}
					}
					++alias;
	    			}
  			});
		}

	});
}



function add_client() {
	get_interface(function (stdout) {
		var serverMongo = new mongodb.Server("127.0.0.1", 27017, {});
		new mongodb.Db('proxy', serverMongo, {}).open(function (error, client) {
	  		if (error) throw error;
	  		var collection = new mongodb.Collection(client, 'client');
// upsert because insert add a lot of same ip
	  		collection.update({ip : stdout}, {$set: {ip : stdout} }, {upsert:true}, function(err) {
				if (err) utils.quicklog("Error client added: ", err.message);
				else utils.quicklog("Added client " + stdout);
				serverMongo.close();
			});
		});	

	});
}

exports.check = check;
exports.domain_mapping = domain_mapping;
exports.information_mapping = information_mapping;
exports.language_mapping = language_mapping;
exports.client_mapping = client_mapping;
exports.get_interface = get_interface;
exports.add_client = add_client;
