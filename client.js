/* MuContent - CLIENT 
	Manage the request and response and the mvc app
*/

// REQUIREMENTS
var utils = require('./lib/utils');
var connect = require('connect');
var app = connect();
var cache = require('./lib/cache');
var health = require('./lib/health');
var Config = require('./config');
var fs = require('fs')

// Instance configuration class for connect
var configuration = new Config();
configuration.Application(app);

function start() {

	// get all controller as a module (all function is route)
	fs.readdir(__dirname + '/controller', function (err, files) {
		files.forEach(function(item) {
			require('./controller/'+item).route();		
		});
	});


	// i can't use the proxy caching because this is a for process and the memory aren't the same
	health.domain_mapping(function callback(objects) {
        	// PUT IN CACHE
        	cache.put('domain', objects);
		objects.forEach( function (row) {
			var site = row.database;
			health.information_mapping(site, function callback(objects) {
	        		// PUT IN CACHE
	        		cache.put(site, objects);
			});
			// put language in cache
			health.language_mapping(site, function callback(objects) {
			        // PUT IN CACHE
				var site_lang = row.database+'_lang';
		        	cache.put(site_lang, objects);
			});
		});
	});

	// REPEAT THESE CHECK
	setInterval(function () {
		var domain = cache.get('domain');
		domain.forEach( function (row) {
			health.domain_mapping(function callback(objects) {
			        // PUT IN CACHE
			        cache.put('domain', objects);
				var site = row.database;
				health.information_mapping(site, function callback(objects) {
			        	// PUT IN CACHE
				        cache.put(site, objects);
				});
			// put the language in cache
				health.language_mapping(site, function callback(objects) {
					var site_lang = row.database+'_lang';
				        // PUT IN CACHE
				        cache.put(site_lang, objects);
				});
			});
		});
	}, configuration.Params.health_information_mapping);

	// INCLUDE START APP
	health.get_interface(function callback (interface) {
		app.listen(configuration.Params.client_port, interface);
		utils.quicklog("Start Application");
		// ADD TO APPSERVER LIST
		health.add_appserver();
	});

}

exports.start = start;
