/* MY BALANCING/MULTISITE PROJECT
	- MULTITHEME
	for theming use css and mustache, get theming by session variables?
	(permit child theme etc as wordpress)
	- MULTISITE
	- MULTIUSER (DEFINE USER AND ACL)
	- MULTIMODULES
	- MULTILANGUAGE
	- SHORTTAG TO INSERT CODE ALL YOU WANT LIKE WORDPRESS
	- FILE STORAGE
	- CRYPTION AND COMPRESSION (OPTIONAL)
	- CHILD SEPARATION, RESTART AND STOP UTILITY
	- CLUSTERED http://learnboost.github.com/cluster/
	- PROTECTION, ALLOWED CLIENT, LIMIT REQUEST
*/

/* START ENTIRE APP
	- WHEN START: 
		- CONTROL IF NO PROXY
			- START PROXY
			- START HEALTH
		- START APP
*/

// REQUIREMENTS
var child_process = require('child_process');
var Proxy = require('./proxy');

var health = require('./lib/health');
var cache = require('./lib/cache');

// START PROXY
var proxy = new Proxy();
proxy.start();

// ISSUE 2: MAPPING DOMAIN AT START AND SITES INFORMATIONS (LAYOUT ETC on client.js see here why)
health.domain_mapping(function callback(objects) {
	// PUT IN CACHE
	cache.put('domain', objects);
});
	health.client_mapping(function callback(objects) {
		// PUT IN CACHE
		cache.put('client_list', objects);
	});

// REPEAT THESE CHECK
setInterval(function () {
      	health.check();
//ISSUE 5: A LOT OF HEALTH CHECK WITH SMALL INTERVAL BLOCK THE APP
}, 5000);
setInterval(function () {
	health.domain_mapping(function callback(objects) {
		// PUT IN CACHE
		cache.put('domain', objects);
	});
}, 45000);
setInterval(function () {
	health.client_mapping(function callback(objects) {
		// PUT IN CACHE
		cache.put('client_list', objects);
	});
}, 10000);
// set che balancer variable on cache
cache.put('next_client', 0);
var balancer = {};
cache.put('balancer', balancer);

// START REAL APP AS A CHILD
var client = child_process.spawn('node', ['client.js']);
