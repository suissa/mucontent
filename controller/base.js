/* BASE CONTROLLER FOR SIMPLE REQUEST
*/

var router = require('route66');
var ModelsBase = require('../models/base.js');
// REQUIRE CLASS TO MANAGE THE ERROR WITH ARRAY AND NOT CATCH
var Validator = require('validator').Validator;
// USE THE CACHE LIBARY (See HOW IT WORKS)
var cache = require('../lib/cache');
var utils = require('../lib/utils');

function route() {

	router.get('/', function (req, res) { 
		if (req.session.info) {
			// add reveal window too
			var data = { reveal: true, sidebar: true }
			utils.rendering(req.headers.host, 'index', data, req.session.connected, function callback(layout) {
				res.end(layout);
			});

		} else {
			utils.rendering(req.headers.host, 'index', {}, req.session.connected, function callback(layout) {
				res.end(layout);
			});
		}
	} );

	router.get('/themes', utils.restricted, function (req, res) { 
		var themes_find = new ModelsBase(req.headers.host);
		themes_find.find({}, function callback(results) {

			utils.rendering(req.headers.host, 'themes', results, req.session.connected, function callback(layout) {
				res.end(layout);
			});
		});
	} );
	router.post('/themes', utils.restricted, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.path, 'path').notEmpty();
		validator.check(req.body.record, 'record').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
			var data = { message: 'Required fields: ' + errors, 
				path: req.body.path, 
				record: req.body.record }
			utils.rendering(req.headers.host, 'themes', data, req.session.connected, function callback(layout) {
				res.end(layout);
			});
		} else {
			var theme_insert = new ModelsBase(req.headers.host);
			var value = { path: req.body.path, record: req.body.record };
			theme_insert.insert(value, function callbacks(results) {

				var data = { form: true,
					data: results }										
				utils.rendering(req.headers.host, 'themes', data, req.session.connected, function callback(layout) {
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
