/* PROXY DEFINITION

*/

var http = require('http');
var utils = require('./lib/utils');
// USE THE CACHE LIBARY 
var cache = require('./lib/cache');

var Server = function () {};

Server.prototype.start = function () {
	http.createServer(this.proxy).listen(80);
	utils.quicklog("Start server");
}

Server.prototype.proxy = function (request, response) {

	// you can use addListner to like this: http://www.catonmat.net/http-proxy-in-nodejs/
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

// choose the client for balancing
	var client_list = cache.get('client_list');

	if (client_list.length == 0) {
		response.end("No client");
		// TODO: do something ......
	}

	var balancer = cache.get('balancer'), next_client;
console.log(client_list);
	if (balancer[request.connection.remoteAddress]) {
		next_client = balancer[request.connection.remoteAddress];
	} else {
		// get a client and put in cache the new item
		// take client random number
		next_client = client_list[Math.floor(Math.random()*client_list.length)];
		balancer[request.connection.remoteAddress] = next_client;
		cache.put('balancer', balancer);
	}


	var options = {host: next_client, port: 8080, method: request.method, path: request.url, headers: request.headers}
	var proxy_request = http.request(options, function (proxy_response) {
	   	proxy_response.on('data', function(chunk) {
      			response.write(chunk, 'binary');
    		});
		proxy_response.on('end', function() {
	      		response.end();
		});
		// ISSUE 1/3: REALLY IMPORTANT, WITH THIS RESOLVE THE SESSION PROBLEMS
	    	response.writeHead(proxy_response.statusCode, proxy_response.headers);
//			console.log(proxy_response.headers);
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

