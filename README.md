MuContent is a multisite and multilanguage cms in Javascript (Node.js) written with a central proxy for balancing the request on multiple client. Based on MongoDB (the intentions are to use it for storage too, without other software for that). Themes are based on Foundation framework and mustache. 

TEMPORARY INSTALLATION:

Go into directory and run: npm install
On MongoDB's shell:

use proxy;
db.sites.insert({"domain" : "mysite.com", "subdomains" : "prova.com,prova1.com", "database" : "mysite" });
use mysite;
db.information.insert({ "type":"path", "method":"index", "pagetitle":"Mysite","header":true, "reveal":true});
db.information.insert({ "type":"path", "method":"login", "pagetitle":"Login", "header":"true","form": "{\"user\":\"true\",\"type\":\"login\"}" })
db.information.insert({ "type":"path", "method":"registration", "pagetitle":"Registration","header":"true","form": "{\"registration\":\"true\",\"user\":\"true\",\"type\":\"registration\"}" })
db.information.insert({ "type":"path", "method":"user", "pagetitle":"User","header":"true","form": "{\"registration\":\"true\",\"user\":\"true\",\"type\":\"user\"}" })
db.information.insert({ "type":"path", "method":"posts", "pagetitle":"Posts","header":"true","form": "{\"post\":\"true\" }" })
db.information.insert({ "type":"path", "method":"themes", "pagetitle":"Themes","header":"true","form": "{\"themes\":\"true\"}" })
db.information.insert({ "type":"path", "method":"404","pagetitle":"404","header":"true" })
db.information.insert({ "type":"menu", "path":"/", "item":"Home"});
db.information.insert({ "type":"menu", "path":"/login", "item":"Login", "acl": "guest"});
db.information.insert({ "type":"menu", "path":"/registration", "item":"Registration", "acl": "guest"});
db.information.insert({ "type":"menu", "path":"/user", "item":"User", "acl": "admin,user"});
db.information.insert({ "type":"menu", "path":"/posts", "item":"Post", "acl": "admin,user"});
db.information.insert({ "type":"menu", "path":"/archive", "item":"Archive"});
db.information.insert({ "type":"menu", "path":"/themes", "item":"Theme", "acl": "admin"});
db.information.insert({ "type":"menu", "path":"/logout", "item":"Logout", "acl": "admin,user"});
db.information.insert({ "type":"module", "name":"posts", "acl": "admin,user"});
db.user.insert({"name":"admin","password":"admin","role":"admin"})

Create a themeindb.js file into directory with:
var fs = require('fs');
var http = require('http');
var tema = fs.readFileSync('./views/default.mustache', 'utf-8');
var mongodb = require('mongodb');
var server = new mongodb.Server("127.0.0.1", 27017, {});
new mongodb.Db('mysite', server, {}).open(function (error, client) {
  if (error) throw error;
  var collection = new mongodb.Collection(client, 'information');
  collection.insert({type: 'theme', html: tema}, {safe:true},
                    function(err, objects) {
    			if (err) console.warn(err.message);
			server.close();
  });
});

Run this file. (node filename.js
Run: node app.js
Points the domain mysite.com, prova.com and prova1.com to 127.0.0.1 on /etc/hosts
On browser: http://mysite.com (or prova.com or prova1.com)

---------------------------------

License

(The MIT License)

Copyright (c) 2012 Andrea Di Mario

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
