/* UTILS FUNCTIONS

*/

var fs = require('fs');
var cache = require('./cache')
var Hogan = require('hogan.js');
var tema = fs.readFileSync('/root/content/views/default.mustache', 'utf-8');

function quicklog(s) {
	// SYNC TO REMOVE REPLACE WHEN WRITE AT THE SAME TIME
	var logpath = "./logs/app.log";
  	var now = new Date();
  	var dateAndTime = now.toUTCString();
  	s = s.toString().replace(/\r\n|\r/g, '\n');
  	var fd = fs.openSync(logpath, 'a+', 0666);
  	fs.writeSync(fd, dateAndTime + ' ' + s + '\n');
  	fs.closeSync(fd);
}

/* path: the path of the request
 data: eventually results from models
 connect: see if user is connected
*/
function rendering(domain, path, data, connect, callback) {
        var site = cache.get(domain);
	var layout = data, menu = [];
// IMP: THE ORDER, IF SET ANOTHER PATH INTO DATABASE AFTER MENU OR THEME, IT CAN'T BE PARSED
// TODO: REWRITE AND REIMPLEMENT THEME INFORMATION STORAGE
        site.forEach( function (row) {
		if (row.method == path) {
			layout.pagetitle = row.pagetitle;
			layout.header = row.header;
			layout.form = row.form;
		}	 
		if (row.type == "menu") {
			menu.push(row);
		}
        });
	layout.menu = menu;
	var template = Hogan.compile(tema);
	var output = template.render(layout);
	callback(output);
}

function restricted(req, res, next) {
	if (req.session.info) {
		next();
	} else {
		rendering(req.headers.host, '404', {}, req.session.connected, function callback(layout) {
			res.end(layout);
		});
	}
}

function auth_yet(req, res, next) {
	if (req.session.info) {
		rendering(req.headers.host, '404', req.session.connected, function callback(objects) {
			var theme = objects.theme, layout = objects.layout;
			layout.message = "Connesso";
			res.render(theme, layout);
		});
	} else {
		next();
	}
}

function restricted_module(req, res, next) {
        var site = cache.get(req.headers.host);
	var method = req.url;
	method = method.split('/')
        site.forEach( function (row) {
        	if (row.module == method[1].replace('/','')){
			var acl = row.acl;
// check if the role is enabled to see the module
//			if (acl.indexOf(req.session.info[0].role)) {
			if (req.session.info && (acl == req.session.info[0].role)) {
				next();
			} else {
				rendering(req.headers.host, '404', req.session.connected, function callback(objects) {
					var theme = objects.theme, layout = objects.layout;
					res.render(theme, layout);
				});
			}
		}
	});
}

exports.quicklog = quicklog;
exports.auth_yet = auth_yet;
exports.rendering = rendering;
exports.restricted = restricted;
exports.restricted_module = restricted_module;
