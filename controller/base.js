/* BASE CONTROLLER FOR SIMPLE REQUEST
*/

var router = require('route66');
var ModelsBase = require('../models/base.js');
// REQUIRE CLASS TO MANAGE THE ERROR WITH ARRAY AND NOT CATCH
var Validator = require('validator').Validator;
// USE THE CACHE LIBARY (See HOW IT WORKS)
var cache = require('../lib/cache');
var utils = require('../lib/utils');
//var newsite = require('../lib/newsite');

function route() {

	router.get('/', function (req, res) { 
		utils.rendering(req.headers.host, 'index', {}, req.session.info, function callback(layout) {
			res.end(layout);
		});
	} );

	router.get('/themes', utils.restricted, function (req, res) { 
		var themes_find = new ModelsBase(req.headers.host);
		themes_find.find({type: 'theme'}, function callback(results) {
			var data = {
				form: {themes: true},
				content: results[0].html
			};
			utils.rendering(req.headers.host, 'themes', data, req.session.info, function callback(layout) {
				res.end(layout);
			});
		});
	} );
	router.post('/themes', utils.restricted, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.content, 'content').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
			var data = { 
				message: { action: 'error', message: 'Required fields: ' + errors}, 
				content: req.body.content
			}
			utils.rendering(req.headers.host, 'themes', data, req.session.info, function callback(layout) {
				res.end(layout);
			});
		} else {
			var theme_update = new ModelsBase(req.headers.host);
			var find = {
				type: 'theme'
			}
			var value = { 
				html: req.body.content 
			};
			theme_update.update(find, value, function callbacks(results) {

				var data = {
					form: {themes: true},
					content: results.html,
					message: {action: 'success', message: 'Wait few minutes for cache refresh'}
				};
				utils.rendering(req.headers.host, 'themes', data, req.session.info, function callback(layout) {
					res.end(layout);
				});

			});			
		}
	} );

	router.get('/path/:operation?/:path?', utils.restricted, function (req, res) { 
		var value = {};
		if (req.params.path) {
			value = {
				type: 'path',
				method: req.params.path 
			}
		} else {
			value = {
				type: 'path'
			}
		}
		var path_find = new ModelsBase(req.headers.host);
		path_find.find(value, function callback(results) {
			if (req.params.operation == "edit") {
				var data = {
					method: results[0].method,
					pathtitle: results[0].pagetitle,	
					formoption: results[0].form,
					headeroption: results[0].header,
					revealoption: results[0].reveal,
					sidebaroption: results[0].sidebar,
					footeroption: results[0].footer
				}
				utils.rendering(req.headers.host, 'path', data, req.session.info, function callback(layout) {
					res.end(layout);
				});
			} else {
				var data = {
					form: {path: false},
					data_path: results
				};
				utils.rendering(req.headers.host, 'path', data, req.session.info, function callback(layout) {
					res.end(layout);
				});
			}
		});
	} );
	router.post('/path', utils.restricted, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.method, 'method').notEmpty();
		validator.check(req.body.pathtitle, 'pagetitle').notEmpty();
		validator.check(req.body.formoption, 'formoption').notEmpty();
		validator.check(req.body.headeroption, 'headeroption').notEmpty();
		validator.check(req.body.revealoption, 'revealoption').notEmpty();
		validator.check(req.body.sidebaroption, 'sidebaroption').notEmpty();
		validator.check(req.body.footeroption, 'footeroption').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
			var data = { 
				message: { action: 'error', message: 'Required fields: ' + errors}, 
				method: req.body.method,
				pathtitle: req.body.pathtitle,					
				formoption: req.body.formoption,
				headeroption: req.body.headeroption,
				revealoption: req.body.revealoption,
				sidebaroption: req.body.sidebaroption,
				footeroption: req.body.footeroption
			}
			utils.rendering(req.headers.host, 'path', data, req.session.info, function callback(layout) {
				res.end(layout);
			});
		} else {
			var path_update = new ModelsBase(req.headers.host);
			var find = { 
				type: 'path',
				method: req.body.method
			};
			var value = {
				pagetitle: req.body.pathtitle,					
				form: req.body.formoption,
				header: req.body.headeroption,
				reveal: req.body.revealoption,
				sidebar: req.body.sidebaroption,
				footer: req.body.footeroption
			}				
			path_update.update(find, value, function callbacks(results) {

				var data = {
					form: {path: false},
					message: {action: 'success', message: 'Wait few minutes for cache refresh'}
				};
				utils.rendering(req.headers.host, 'path', data, req.session.info, function callback(layout) {
					res.end(layout);
				});

			});			
		}
	} );

	router.get('/menu/:operation?/:item?', utils.restricted, function (req, res) { 
		var value = {};
		if (req.params.item) {
			value = {
				type: 'menu',
				item: req.params.item 
			}
		} else {
			value = {
				type: 'menu'
			}
		}
		var menu_find = new ModelsBase(req.headers.host);
		menu_find.find(value, function callback(results) {
			if (req.params.operation == "edit") {
				var data = {
					pathvalue: results[0].path,
					itemvalue: results[0].item,
					acl: results[0].acl
				}
				utils.rendering(req.headers.host, 'menu', data, req.session.info, function callback(layout) {
					res.end(layout);
				});
			} else {
				var data = {
					form: {menulist: false},
					data_menulist: results
				};
				utils.rendering(req.headers.host, 'menu', data, req.session.info, function callback(layout) {
					res.end(layout);
				});
			}
		});
	} );
	router.post('/menu', utils.restricted, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.pathvalue, 'path').notEmpty();
		validator.check(req.body.itemvalue, 'item').notEmpty();
		validator.check(req.body.acl, 'acl').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
			var data = { 
				message: { action: 'error', message: 'Required fields: ' + errors}, 
				pathvalue: req.body.pathvalue,
				itemvalue: req.body.itemvalue,
				acl: req.body.acl
			}
			utils.rendering(req.headers.host, 'menu', data, req.session.info, function callback(layout) {
				res.end(layout);
			});
		} else {
			var menu_update = new ModelsBase(req.headers.host);
			var find = { 
				type: 'menu',
				path: req.body.pathvalue
			};
			var value = {
				item: req.body.itemvalue,
				acl: req.body.acl
			}				
			menu_update.update(find, value, function callbacks(results) {

				var data = {
					form: {path: false},
					message: {action: 'success', message: 'Wait few minutes for cache refresh'}
				};
				utils.rendering(req.headers.host, 'path', data, req.session.info, function callback(layout) {
					res.end(layout);
				});

			});			
		}
	} );


	router.get('/invalid', function (req, res) {
		res.writeHead(404, "Content-type: text/html");
		res.end("<center>You request isn't valid, contact: ...</center>");
	} );

	router.get('/status', function (req, res) {
		res.end("HI");
	} );

}

exports.route = route
