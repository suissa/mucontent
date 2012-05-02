/* BASE CONTROLLER FOR SIMPLE REQUEST
*/

var router = require('route66');
var ModelsBase = require('../models/base.js');
// REQUIRE CLASS TO MANAGE THE ERROR WITH ARRAY AND NOT CATCH
var Validator = require('validator').Validator;
// USE THE CACHE LIBARY (See HOW IT WORKS)
var cache = require('../lib/cache');
var utils = require('../lib/utils');
var newsite = require('../lib/newsite');

function route() {

	router.get('/', function (req, res) { 
		if (req.session.info) {
			// add reveal window too
			var data = { reveal: true, sidebar: true }
			utils.rendering(req.headers.host, 'index', data, req.session.info, function callback(layout) {
				res.end(layout);
			});

		} else {
console.log(req.headers.host);
			utils.rendering(req.headers.host, 'index', {}, req.session.info, function callback(layout) {
				res.end(layout);
			});
		}
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
				type: 'theme', html: req.body.content };
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

	router.get('/newsite', utils.restricted, function (req, res) {
		var data = { form: {newsite: true}}; 
		utils.rendering(req.headers.host, 'themes', data, req.session.info, function callback(layout) {
			res.end(layout);
		});
	} );
	router.post('/newsite', utils.restricted, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.domain, 'domain').notEmpty();
		validator.check(req.body.subdomains, 'subdomians').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
			var data = { form: {newsite: true},
				message: { action: 'error', message: 'Required fields: ' + errors}, 
				domain: req.body.domain,
				subdomains: req.body.subdomains
			}
			utils.rendering(req.headers.host, 'themes', data, req.session.info, function callback(layout) {
				res.end(layout);
			});
		} else {
			var database = req.body.domain;
			database = database.split('.');
			var information = {
				domain: req.body.domain,
				subdomains: req.body.subdomains,
				database: database
			};
			newsite.newsite(information, database);

			var data = {
				message: {action: 'success', message: 'Done'}
			};
			utils.rendering(req.headers.host, 'themes', data, req.session.info, function callback(layout) {
				res.end(layout);
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
