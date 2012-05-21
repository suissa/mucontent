/* CREATE FIRST SITE OR A NEW SITE
*/

var fs = require('fs');
var mongodb = require('mongodb');

var defaultroute = [
{ "type":"path", "method":"index", "pagetitle":"Mysite","header":true, "reveal":true, "sidebar":true,"form": "{\"index\":\"false\"}", "footer":true},
{ "type":"path", "method":"login", "pagetitle":"Login", "header":"true", "reveal": false, "sidebar":true, "form": "{\"user\":\"true\",\"type\":\"login\"}", "footer":true },
{ "type":"path", "method":"registration", "pagetitle":"Registration","header":"true","reveal":false, "sidebar":true,"form": "{\"registration\":\"true\",\"user\":\"true\",\"type\":\"registration\"}", "footer":true },
{ "type":"path", "method":"user", "pagetitle":"User","header":"true","reveal":false, "sidebar":true,"form": "{\"registration\":\"true\",\"user\":\"true\",\"type\":\"user\"}", "footer":true },
{ "type":"path", "method":"themes", "pagetitle":"Themes","header":"true","reveal":false, "sidebar":true,"form": "{\"themes\":\"true\"}", "footer":true },
{ "type":"path", "method":"path", "pagetitle":"Path","header":"true","reveal":false, "sidebar":true,"form": "{\"path\":\"true\"}", "footer":true },
{ "type":"path", "method":"module", "pagetitle":"Module","header":"true","reveal":false, "sidebar":true,"form": "{\"module\":\"false\"}", "footer":true },
{ "type":"path", "method":"menu", "pagetitle":"Menu List","header":"true","reveal":false, "sidebar":true,"form": "{\"menulist\":\"true\"}", "footer":true },
{ "type":"path", "method":"404","pagetitle":"404","header":"true","reveal":false, "sidebar":false,"form": "{\"404\":\"false\"}", "footer":true  },
{ "type":"menu", "path":"/logout", "item":"Logout", "acl": "admin,user", "position": "8"},
{ "type":"menu", "path":"/themes", "item":"Theme", "acl": "admin","position": "7"},
{ "type":"menu", "path":"/menu", "item":"Menu", "acl": "admin", "position": "6"},
{ "type":"menu", "path":"/path", "item":"Path", "acl": "admin", "position": "5"},
{ "type":"menu", "path":"/module", "item":"Module", "acl": "admin", "position": "4"},
{ "type":"menu", "path":"/user", "item":"User", "acl": "admin,user", "position": "3"},
{ "type":"menu", "path":"/registration", "item":"Registration", "acl": "guest", "position":"2"},
{ "type":"menu", "path":"/login", "item":"Login", "acl": "guest", "position": "1"},
{ "type":"menu", "path":"/", "item":"Home","acl":"guest,admin,user", "position": "0"},
{ "type":"module", "name":"themes", "acl": "admin"},
{ "type":"module", "name":"path", "acl": "admin"},
{ "type":"module", "name":"menu", "acl": "admin"},
{ "type":"module", "name":"module", "acl": "admin"},
]

var database, information = {}, domain, subdomains, count = 0;

process.argv.forEach(function (val, index, array) {
	if (index == 2)
		domain = val;
	if (index == 3) 
		subdomains = val;
});

database = domain.split('.')[0];
information = {
	domain: domain,
	subdomains: subdomains,
	database: database
};

// SET DEFAULT ROUTE AND PATH
defaultroute.forEach( function (row) {
	var server2 = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db(database, server2, {}).open(function (error, client) {
  		if (error) throw error;
  		var collection = new mongodb.Collection(client, 'information');
	  		collection.insert(row, {safe:true},
	                    	function(err, objects) {
    				if (err) console.log(err.message);
				server2.close();
  			});
		});
	count++;
	if (count == defaultroute.length)
		console.log("Done Route Installation");
});

// SET THE DEFAULT ADMIN
var server3 = new mongodb.Server("127.0.0.1", 27017, {});
new mongodb.Db(database, server3, {}).open(function (error, client) {
	if (error) throw error;
	var collection = new mongodb.Collection(client, 'user');
	collection.insert({name: 'admin', password: 'd033e22ae348aeb5660fc2140aec35850c4da997', role: 'admin'}, {safe:true},
              	function(err, objects) {
 			if (err) console.log(err.message);
			else console.log("Done Admin Installation");
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
    			if (err) console.log(err.message);
			else console.log("Done Theme Installation");
			server4.close();
	});
});

	// SET SITE INFORMATION IN PROXY TABLE
var server1 = new mongodb.Server("127.0.0.1", 27017, {});
new mongodb.Db('proxy', server1, {}).open(function (error, client) {
	if (error) throw error;
	var collection = new mongodb.Collection(client, 'sites');
	collection.insert(information, {safe:true}, function(err, objects) {
		if (err) console.log(err.message);
		else console.log("Done Proxy Installation");
		server1.close();
	});
});



