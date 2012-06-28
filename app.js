/* MuContent
        A multisite, multilanguage, modulare and scalable CMS
        https://github.com/anddimario/mucontent
*/

// REQUIREMENTS
var Proxy = require('./proxy');
var client = require('./client');
var health = require('./lib/health');
var cache = require('./lib/cache');
var utils = require('./lib/utils');
var cluster = require('cluster');
var Config = require('./config');
var http = require('http');

var configuration = new Config();

var numCPUs = require('os').cpus().length;

// If app.js goes down, app works thanks to workers
// if all workers go down and app.js is up, the proxy and app don't work
if (cluster.isMaster) {

	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
                cluster.fork();
        }

        cluster.on('exit', function(worker) {
        	utils.quicklog('Worker ' + worker.pid + ' died. Restart...');
		// refork the process if one death
		cluster.fork();
	});

} else {
        // See if is set the heatbeat command to manage the specific ip
        if (configuration.Params.network_configuration_command) {
		// check if there is a master proxy, if not run a proxy
	       	var options = {
                        host: configuration.Params.heartbeat_ip,
                        port: 80,
                        method: 'GET',
                        path: '/status'
                }

                var request = http.request(options, function (res) {
                        utils.quicklog("Check master proxy " + options.host + " status: " + res.statusCode);
                });
                request.on('error', function(error) {

			// START PROXY
			var proxy = new Proxy();
			proxy.start();
		});
	} else {
		// START PROXY
		var proxy = new Proxy();
		proxy.start();
	}
	// START CLIENT
	client.start();
}

// MAPPING DOMAIN AT START AND SITES INFORMATIONS (LAYOUT ETC on client.js see here why)
health.domain_mapping(function callback(objects) {
	// PUT IN CACHE
	cache.put('domain', objects);
});
health.appserver_mapping(function callback(objects) {
	// PUT IN CACHE
	cache.put('appserver_list', objects);
});

// REPEAT THESE CHECK
setInterval(function () {
      	health.check();
// A LOT OF HEALTH CHECK WITH SMALL INTERVAL BLOCK THE APP
}, 5000);
setInterval(function () {
	health.domain_mapping(function callback(objects) {
		// PUT IN CACHE
		cache.put('domain', objects);
	});
}, 45000);
setInterval(function () {
	health.appserver_mapping(function callback(objects) {
		// PUT IN CACHE
		cache.put('appserver_list', objects);
	});
}, 10000);

