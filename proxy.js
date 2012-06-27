/* MuContent - PROXY DEFINITION
	Manage balancer, high availability and multisite
*/

// REQUIREMENTS
var http = require('http');
var utils = require('./lib/utils');
var cache = require('./lib/cache');
var Config = require('./config');
var exec = require('child_process').exec;

var configuration = new Config();

// PROXY CLASS DEFINITION
var Server = function () {};

Server.prototype.start = function () {

	// See if is set the heatbeat command to manage the specific ip
	if (configuration.Params.network_configuration_command) {
		// configure the network shared ip
		exec(configuration.Params.network_configuration_command, function (stderr, stdout, stdin) {
			utils.quicklog('Network shared ip configuration ', stderr, stdout);
		});
	}
	http.createServer(this.proxy).listen(80, configuration.Params.heartbeat_ip);
	utils.quicklog("Start server");
}

Server.prototype.proxy = function (request, response) {

	// you can use addListner too like this: http://www.catonmat.net/http-proxy-in-nodejs/
	// but on new nodejs use .on
	utils.quicklog("Request " + request.connection.remoteAddress + " " + request.method + " " + request.url + " - " + request.headers.host);

	var domain = cache.get('domain');
	// use this to send errors or other if the domain isn't mapping, reset path to
	// the invalid url managed by express controller base
	var find_domain = false;
	domain.forEach( function (row) {
		var subdomains = row.subdomains;
		if (subdomains) {
			subdomains = subdomains.split(',');
			subdomains.forEach( function (sub) {
				if (request.headers.host == sub) {
					request.headers.host = row.database;
					find_domain = true;
				}
			});
		}
		if (request.headers.host === row.domain) {
			find_domain = true;
			request.headers.host = row.database;
		}
	});
	if (find_domain == false) {
		request.url = '/invalid';
	}
	
	// choose the client for balancing (balancing type: round robin)
	var appserver_list = cache.get('appserver_list');
	var choosed_client = cache.get('last_client');

	var next_client = appserver_list[choosed_client];

	if ((choosed_client == appserver_list.length-1) || (appserver_list.length == 1)) {
		cache.put('last_client', 0);
	} else {
		cache.put('last_client', choosed_client+1);
	}

console.log(next_client, choosed_client, appserver_list.length)
	var options = {host: next_client, port: 8080, method: request.method, path: request.url, headers: request.headers}
console.log(options);
	var proxy_request = http.request(options, function (proxy_response) {
	   	proxy_response.on('data', function(chunk) {
      			response.write(chunk, 'binary');
    		});
		proxy_response.on('end', function() {
	      		response.end();
		});
		// WITH THIS RESOLVE THE SESSION PROBLEMS, EACH SITE HAS ONE
	    	response.writeHead(proxy_response.statusCode, proxy_response.headers);
	});
	proxy_request.on('error', function(error) {
              	utils.quicklog("Connection refused by client");
       	});
	request.on('data', function(chunk) {
		proxy_request.write(chunk, 'binary');
	});
	request.on('end', function() {
    		proxy_request.end();
  	});
	proxy_request.end();
}

module.exports = Server;

