/* MY SITE
*/

// REQUIREMENTS
var utils = require('./lib/utils');
var connect = require('connect');
var app = connect();
// for caching layout
var cache = require('./lib/cache');
var health = require('./lib/health');
var Config = require('./config');

var configuration = new Config(app);

var fs = require('fs')

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
}, 15000);

// INCLUDE START APP
health.get_interface( function (stdout) {
	app.listen(8080, stdout);
	utils.quicklog("Start Application");
	// ADD TO CLIENT LIST
	health.add_client();
});

}

exports.start = start;
