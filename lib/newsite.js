/* CREATE FIRST SITE OR A NEW SITE
*/

var fs = require('fs');
var mongodb = require('mongodb');
var utils = require('./utils');

var defaultroute = [
{ "type":"path", "method":"index", "pagetitle":"Mysite","header":true, "reveal":true},
{ "type":"path", "method":"login", "pagetitle":"Login", "header":"true","form": "{\"user\":\"true\",\"type\":\"login\"}" },
{ "type":"path", "method":"registration", "pagetitle":"Registration","header":"true","form": "{\"registration\":\"true\",\"user\":\"true\",\"type\":\"registration\"}" },
{ "type":"path", "method":"user", "pagetitle":"User","header":"true","form": "{\"registration\":\"true\",\"user\":\"true\",\"type\":\"user\"}" },
{ "type":"path", "method":"posts", "pagetitle":"Posts","header":"true","form": "{\"post\":\"true\" }" },
{ "type":"path", "method":"themes", "pagetitle":"Themes","header":"true","form": "{\"themes\":\"true\"}" },
{ "type":"path", "method":"404","pagetitle":"404","header":"true" },
{ "type":"menu", "path":"/", "item":"Home"},
{ "type":"menu", "path":"/login", "item":"Login", "acl": "guest"},
{ "type":"menu", "path":"/registration", "item":"Registration", "acl": "guest"},
{ "type":"menu", "path":"/user", "item":"User", "acl": "admin,user"},
{ "type":"menu", "path":"/posts", "item":"Post", "acl": "admin,user"},
{ "type":"menu", "path":"/archive", "item":"Archive"},
{ "type":"menu", "path":"/themes", "item":"Theme", "acl": "admin"},
{ "type":"menu", "path":"/logout", "item":"Logout", "acl": "admin,user"},
{ "type":"module", "name":"posts", "acl": "admin,user"}
]

function newsite(information, database) {

// SET SITE INFORMATION IN PROXY TABLE
	var server1 = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db('proxy', server1, {}).open(function (error, client) {
  		if (error) throw error;
  		var collection = new mongodb.Collection(client, 'sites');
  		collection.insert(information, {safe:true}, function(err, objects) {
    			if (err) utils.quicklog(err.message);
			server1.close();
  		});
	});

// SET DEFAULT ROUTE AND PATH
	var server2 = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db(database, server2, {}).open(function (error, client) {
  		if (error) throw error;
  		var collection = new mongodb.Collection(client, 'information');
		defaultroute.forEach( function (row) {
	  		collection.insert(row, {safe:true},
	                    	function(err, objects) {
    				if (err) utils.quicklog(err.message);
				server2.close();
  			});
		});
	});

// SET THE DEFAULT ADMIN
	var server3 = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db(database, server3, {}).open(function (error, client) {
  		if (error) throw error;
  		var collection = new mongodb.Collection(client, 'user');
  		collection.insert({name: 'admin', password: 'admin', role: 'admin'}, {safe:true},
                    	function(err, objects) {
    			if (err) utils.quicklog(err.message);
			server3.close();
  		});
	});


// PUT THE DEFAULT THEME IN THE DATABASE

	var default_theme = fs.readFileSync('../views/default.mustache', 'utf-8');
	var server4 = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db(database, server4, {}).open(function (error, client) {
  		if (error) throw error;
  		var collection = new mongodb.Collection(client, 'information');
  		collection.insert({type: 'theme', html: default_theme}, {safe:true},
                    	function(err, objects) {
    			if (err) utils.quicklog(err.message);
			server4.close();
  		});
	});

}

exports.newsite = newsite;
