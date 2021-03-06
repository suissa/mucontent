/* CREATE FIRST SITE OR A NEW SITE
*/

var fs = require('fs');
var mongodb = require('mongodb');
var Config = require('../config');

var configuration = new Config();

var defaultroute = [
{ "type":"page", "method":"index", "pagetitle":"Mysite,","header":true, "reveal":true, "sidebar":true,"form": "{\"form_index\":\"false\"}","content":"{\"content_index\":\"true\"}", "footer":true},
{ "type":"page", "method":"login", "pagetitle":"Login,", "header":"true", "reveal": false, "sidebar":true, "form": "{\"form_user\":\"true\",\"type\":\"login\"}", "content":"{\"content_login\":\"true\"}", "footer":true },
{ "type":"page", "method":"registration", "pagetitle":"Registration,","header":"true","reveal":false, "sidebar":true,"form": "{\"form_user\":\"true\",\"registration\":\"true\",\"type\":\"registration\"}", "content":"{\"content_registration\":\"true\"}", "footer":true },
{ "type":"page", "method":"user", "pagetitle":"User,","header":"true","reveal":false, "sidebar":true,"form": "{\"form_registration\":\"true\",\"user\":\"true\",\"type\":\"user\"}", "content":"{\"content_user\":\"true\"}", "footer":true },
{ "type":"page", "method":"themes", "pagetitle":"Themes,","header":"true","reveal":false, "sidebar":true,"form": "{\"form_themes\":\"true\"}", "content":"{\"content_themes\":\"true\"}", "footer":true },
{ "type":"page", "method":"language", "pagetitle":"Language,","header":"true","reveal":false, "sidebar":true,"form": "{\"form_language\":\"true\"}", "content":"{\"content_language\":\"true\"}", "footer":true },
{ "type":"page", "method":"content", "pagetitle":"Content,","header":"true","reveal":false, "sidebar":true,"form": "{\"form_content\":\"true\"}", "content":"{\"content_content\":\"true\"}", "footer":true },
{ "type":"page", "method":"page", "pagetitle":"Page,","header":"true","reveal":false, "sidebar":true,"form": "{\"form_page\":\"true\"}", "content":"{\"content_page\":\"true\"}", "footer":true },
{ "type":"page", "method":"module", "pagetitle":"Module,","header":"true","reveal":false, "sidebar":true,"form": "{\"form_module\":\"false\"}", "content":"{\"content_module\":\"true\"}", "footer":true },
{ "type":"page", "method":"menu", "pagetitle":"Menu List,","header":"true","reveal":false, "sidebar":true,"form": "{\"form_menulist\":\"true\"}", "content":"{\"content_menulist\":\"true\"}", "footer":true },
{ "type":"page", "method":"submenu", "pagetitle":"SubMenu List,","header":"true","reveal":false, "sidebar":true,"form": "{\"form_submenulist\":\"true\"}", "content":"{\"content_submenulist\":\"true\"}", "footer":true },
{ "type":"page", "method":"domains", "pagetitle":"Domains List,","header":"true","reveal":false, "sidebar":true,"form": "{\"form_domainlist\":\"true\"}", "content":"{\"content_domainlist\":\"true\"}", "footer":true },
{ "type":"page", "method":"maintenance", "pagetitle":"Maintenance Mode,","header":"true","reveal":false, "sidebar":true,"form": "{\"form_maintenance\":\"true\"}", "content":"{\"content_maintenance\":\"true\"}", "footer":true },
{ "type":"page", "method":"404","pagetitle":"404,","header":"true","reveal":false, "sidebar":false,"form": "{\"form_404\":\"false\"}", "content":"{\"content_404\":\"true\"}", "footer":true  },
{ "type":"menu", "path":"/logout", "tag":"logout", "item":"Logout,", "acl": "admin,user", "position": "5"},
{ "type":"menu", "path":"#", "tag":"admin", "item":"Admin,", "acl": "admin", "position": "4"},
{ "type":"menu", "path":"/user", "tag":"user", "item":"User,", "acl": "admin,user", "position": "3"},
{ "type":"menu", "path":"/registration", "tag":"registration", "item":"Registration,", "acl": "guest", "position":"2"},
{ "type":"menu", "path":"/login", "tag":"login", "item":"Login,", "acl": "guest", "position": "1"},
{ "type":"menu", "path":"/", "tag":"home", "item":"Home,","acl":"guest,admin,user", "position": "0"},
// THE SUBMENU
{ "type":"submenu", "submenu_path":"/submenu", "tag":"submenu", "submenu_item":"SubMenu,", "acl": "admin", "position": "8", "parent_position": "4"},
{ "type":"submenu", "submenu_path":"/domains", "tag":"domains", "submenu_item":"Domains,", "acl": "admin","position": "7", "parent_position": "4"},
{ "type":"submenu", "submenu_path":"/maintenance", "tag":"maintenance", "submenu_item":"Maintenance,", "acl": "admin","position": "6", "parent_position": "4"},
{ "type":"submenu", "submenu_path":"/content", "tag":"content", "submenu_item":"Content,", "acl": "admin","position": "5", "parent_position": "4"},
{ "type":"submenu", "submenu_path":"/language", "tag":"language", "submenu_item":"Language,", "acl": "admin","position": "4", "parent_position": "4"},
{ "type":"submenu", "submenu_path":"/themes", "tag":"themes", "submenu_item":"Theme,", "acl": "admin","position": "3", "parent_position": "4"},
{ "type":"submenu", "submenu_path":"/menu", "tag":"menu", "submenu_item":"Menu,", "acl": "admin", "position": "2", "parent_position": "4"},
{ "type":"submenu", "submenu_path":"/page", "tag":"page", "submenu_item":"Page,", "acl": "admin", "position": "1", "parent_position": "4"},
{ "type":"submenu", "submenu_path":"/module", "tag":"module", "submenu_item":"Module,", "acl": "admin", "position": "0", "parent_position": "4"},

{ "type":"module", "name":"domains", "acl": "admin"},
{ "type":"module", "name":"maintenance", "acl": "admin"},
{ "type":"module", "name":"themes", "acl": "admin"},
{ "type":"module", "name":"language", "acl": "admin"},
{ "type":"module", "name":"content", "acl": "admin"},
{ "type":"module", "name":"page", "acl": "admin"},
{ "type":"module", "name":"menu", "acl": "admin"},
{ "type":"module", "name":"submenu", "acl": "admin"},
{ "type":"module", "name":"module", "acl": "admin"},
{ "type":"language", "lang_id":"0", "lang_name": "English"},
]

var defaultcontent = [
{ "type": "message", "tag": "disconnected", "lang_id": "0", "text": "Disconnected" },
{ "type": "message", "tag": "connected", "lang_id": "0", "text": "Connected " },
{ "type": "message", "tag": "registrated", "lang_id": "0", "text": "Thanks for registrations, good navigation" },
{ "type": "message", "tag": "required", "lang_id": "0", "text": "Required fields: " },
{ "type": "message", "tag": "alreadyexists", "lang_id": "0", "text": "The item already exists" },
{ "type": "message", "tag": "notfound", "lang_id": "0", "text": "Not found" },
{ "type": "message", "tag": "deleted", "lang_id": "0", "text": "Deleted" },
{ "type": "message", "tag": "notchange", "lang_id": "0", "text": "You can't change your username" },
{ "type": "message", "tag": "waitrefresh", "lang_id": "0", "text": "Please wait cache refresh for changes" },
{ "type": "message", "tag": "done", "lang_id": "0", "text": "Done!" }
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
	database: database,
	maintenance: false
};

// SET DEFAULT ROUTE AND PATH
defaultroute.forEach( function (row) {
	var server2 = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {});
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
var server3 = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {});
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
var server4 = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {});
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
var server1 = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {});
new mongodb.Db('proxy', server1, {}).open(function (error, client) {
	if (error) throw error;
	var collection = new mongodb.Collection(client, 'sites');
	collection.insert(information, {safe:true}, function(err, objects) {
		if (err) console.log(err.message);
		else console.log("Done Proxy Installation");
		server1.close();
	});
});

count = 0;
// SET DEFAULT CONTENT
defaultcontent.forEach( function (row) {
	var server5 = new mongodb.Server(configuration.Params.mongodb_ip, configuration.Params.mongodb_port, {});
	new mongodb.Db(database, server5, {}).open(function (error, client) {
  		if (error) throw error;
  		var collection = new mongodb.Collection(client, 'content');
	  		collection.insert(row, {safe:true},
	                    	function(err, objects) {
    				if (err) console.log(err.message);
				server5.close();
  			});
		});
	count++;
	if (count == defaultcontent.length)
		console.log("Done Content Installation");
});

