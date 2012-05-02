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
console.log(site);
		health.information_mapping(site, function callback(objects) {
	        	// PUT IN CACHE
	        	cache.put(site, objects);
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
	});
});
}, 15000);

// INCLUDE START APP
app.listen(8080, '127.0.0.1');
utils.quicklog("Start Application");

// ADD TO CLIENT LIST
health.add_client();
