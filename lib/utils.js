/* UTILS FUNCTIONS

*/

var fs = require('fs');
var cache = require('./cache')
var Hogan = require('hogan.js');

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
 role: see user role
*/
function rendering(domain, path, data, info, callback) {
console.log(domain);
        var site = cache.get(domain);
	var layout = data, menu = [], theme, role;
	if (info) {
		role = info.role;
	} else {
		role = 'guest';
	}
// IMP: THE ORDER, IF SET ANOTHER PATH INTO DATABASE AFTER MENU OR THEME, IT CAN'T BE PARSED
// TODO: REWRITE AND REIMPLEMENT THEME INFORMATION STORAGE
        site.forEach( function (row) {
		if (row.method == path) {
			layout.pagetitle = row.pagetitle;
			layout.header = row.header;
			if (row.form && ! data.form) {
				layout.form = JSON.parse(row.form);
			}
		}	 
		if (row.type == "menu") {
// TODO: PUSH ON MENU BASED ON ACL AND CONNECTED USER
			if (row.acl) {
				var acl = row.acl;
				acl = acl.split(',');
				acl.forEach( function (item) {
					if (item == role) {
						menu.push(row);
					}
				});
			} else {
				menu.push(row);
			}
		}
		if (row.type == "theme") {
			theme = row.html;
		}
        });
	layout.menu = menu;
	var template = Hogan.compile(theme);
	var output = template.render(layout);
	callback(output);
}

function restricted(req, res, next) {
	if (req.session.info) {
		next();
	} else {
		rendering(req.headers.host, '404', {}, req.session.info, function callback(layout) {
			res.end(layout);
		});
	}
}

function auth_yet(req, res, next) {
	if (req.session.info) {
		var data = {message: "Connesso " + req.session.info.name};
		rendering(req.headers.host, '404', data, req.session.info, function callback(layout) {
			res.end(layout);
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
        	if (row.name == method[1].replace('/','')){
			var acl = row.acl;
// check if the role is enabled to see the module
			acl = acl.split(',');
			if (req.session.info) {
				var role = req.session.info.role, find = false;
				acl.forEach( function (item) { 
					if (item === role) find = true;
				});
				if (req.session.info && find) {
					next();
				} else {
					rendering(req.headers.host, '404', {}, req.session.info, function callback(layout) {
						res.end(layout);
					});
				}
			} else {
					rendering(req.headers.host, '404', {}, req.session.info, function callback(layout) {
						res.end(layout);
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
