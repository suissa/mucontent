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
var Proxy = require('./proxy');
var client = require('./client');

var health = require('./lib/health');
var cache = require('./lib/cache');
var utils = require('./lib/utils');
var cluster = require('cluster');

var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
                cluster.fork();
        }

        cluster.on('death', function(worker) {
        	utils.quicklog('Worker ' + worker.pid + ' died');
        });
} else {
// START PROXY
	var proxy = new Proxy();
	proxy.start();
// START CLIENT
	client.start();
}

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

// set the balancer variable on cache
cache.put('next_client', 0);
var balancer = {};
cache.put('balancer', balancer);

