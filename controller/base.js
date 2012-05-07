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
				path: req.body.content
			}
			utils.rendering(req.headers.host, 'themes', data, req.session.info, function callback(layout) {
				res.end(layout);
			});
		} else {
			var theme_update = new ModelsBase(req.headers.host);
			var value = { 
				type: 'theme', html: req.body.content 
			};
			theme_update.update(value, function callbacks(results) {

				var data = {
					form: {themes: true},
					content: results.html,
					message: 'Wait few minutes for cache refresh'
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
		validator.check(req.body.content, 'content').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
			var data = { 
				message: { action: 'error', message: 'Required fields: ' + errors}, 
				path: req.body.content
			}
			utils.rendering(req.headers.host, 'themes', data, req.session.info, function callback(layout) {
				res.end(layout);
			});
		} else {
			var theme_update = new ModelsBase(req.headers.host);
			var value = { 
				type: 'theme', html: req.body.content 
			};
			theme_update.update(value, function callbacks(results) {

				var data = {
					form: {themes: true},
					content: results.html,
					message: 'Wait few minutes for cache refresh'
				};
				utils.rendering(req.headers.host, 'themes', data, req.session.info, function callback(layout) {
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
