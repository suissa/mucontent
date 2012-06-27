/* UTILS FUNCTIONS

*/

var fs = require('fs');
var cache = require('./cache')
var Hogan = require('hogan.js');
var Config = require('../config');


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

/* 
 message: the message that you can pass to layout
 path: the path of the request
 data: eventually results from models
 info: see user role
 language: language value
*/
function rendering(domain, path, data, info, lang, message, callback) {
        var site = cache.get(domain);
	var layout = data, menu = [], theme, role, languages = [], submenu_tmp = []; 
	if (info) {
		role = info.role;
	} else {
		role = 'guest';
	}
	if (!lang) {
		lang = 0;
	}
// IMP: THE ORDER, IF SET ANOTHER PATH INTO DATABASE AFTER MENU OR THEME, IT CAN'T BE PARSED
        site.forEach( function (row) {
		if (row.method == path) {
// get the correct lang title, 0 for default if no language choosed
			var pagetitle = row.pagetitle;
			layout.pagetitle = pagetitle.split(',')[lang];
			layout.header = row.header;
			layout.reveal = row.reveal;
			layout.footer = row.footer;
			layout.sidebar = row.sidebar;
//			layout['content_'+path] = row['content_'+path];
			if (row.form && ! data.form) {
				layout.form = JSON.parse(row.form);
			}
			if (row.content) {
				layout.staticcontent = JSON.parse(row.content);
			}
		}	 
		if (row.type == "menu") {
// PUSH ON MENU BASED ON ACL AND CONNECTED USER
			var split_item = row.item;
			// get here the right menu language with the split of the array
			var add = {path: row.path, item: split_item.split(',')[lang]};
			if (row.acl) {
				var acl = row.acl;
				acl = acl.split(',');
				acl.forEach( function (item) {
					if (item == role) {
						menu[row.position] = add;
					}
				});
			} else {
				menu[row.position] = add;
			}
		}
		if (row.type === "submenu") {
			if (row.acl) {
				var acl = row.acl;
				acl = acl.split(',');
				acl.forEach( function (item) {
					if (item == role) {
						submenu_tmp.push(row);
					}
				});
			}
		}
		if (row.type == "language") {
			languages.push(row);
		}
		if (row.type == "theme") {
			theme = row.html;
		}
        });
	submenu_tmp.forEach( function (row) {
		// IMP: ADD THIS BECAUSE SOME PATH COULD HAVE RESTRICTED MODULE
		if(menu[row.parent_position]) {
			var split_item = row.submenu_item;
			var add = {submenu_path: row.submenu_path, submenu_item: split_item.split(',')[lang]};
			// get the parent position and update with the submenu
			var temp = menu[row.parent_position];
			// the first time is empty parent definition
			if (!temp.is_parent) {
				temp.is_parent = {submenu: []};
			}
			temp.is_parent.submenu[row.position] = add;
			menu[row.parent_position] = temp;
		}
	});
	var site_lang = cache.get(domain+'_lang');
        site_lang.forEach( function (row) {
		if ((row.type === "message") && (row.tag === message.reference)) {
			layout.message = {
				action: message.action,
				message: row.text + message.value
			};
		}
// define the content by language that pass to mustache rendering 
		if ((row.type === "content") && (row.lang_id == lang)) {
			layout[row.tag] = row.text;
		}				 
	});
	layout.menu = menu;
	layout.languages = languages;
	var template = Hogan.compile(theme);
	var output = template.render(layout);
	callback(output);
}

function restricted(req, res, next) {
	if (req.session.info) {
		next();
	} else {
		rendering(req.headers.host, '404', {}, req.session.info, req.session.lang, {}, function callback(layout) {
			res.end(layout);
		});
	}
}

function auth_yet(req, res, next) {
	if (req.session.info && (req.session.info.role !== "admin")) {
		var message = {
			action: 'success',
			message: 'connected',
			value: req.session.info.name
		};
		rendering(req.headers.host, '404', data, req.session.info, req.session.lang, message, function callback(layout) {
			res.end(layout);
		});
	} else {
		next();
	}
}

function restricted_module(req, res, next) {
	// continue if install
	if (req.params.operation === "install") {
		next();
	}

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
					rendering(req.headers.host, '404', {}, req.session.info, req.session.lang, {}, function callback(layout) {
						res.end(layout);
					});
				}
			} else {
					rendering(req.headers.host, '404', {}, req.session.info, req.session.lang, {}, function callback(layout) {
						res.end(layout);
					});
			}
		}
	});
}

function maintenance(req, res, next) {
	var configuration = new Config();
        var domain = cache.get('domain');
	domain.forEach( function (row) {
		if (req.headers.host === row.database) {
			if (row.maintenance) {
				// permite only admin 
				if ((req.session.info) && (req.session.info.role === "admin"))  {
					next();
				} else {
					res.end(configuration.Params.maintenance_message);
				}
			} else {
				next();
			}
		}
	});
}

exports.quicklog = quicklog;
exports.auth_yet = auth_yet;
exports.rendering = rendering;
exports.restricted = restricted;
exports.restricted_module = restricted_module;
exports.maintenance = maintenance;
