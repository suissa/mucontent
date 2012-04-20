/* BASE CONTROLLER FOR SIMPLE REQUEST
*/

var ModelsBase = require('../models/base.js');
// REQUIRE CLASS TO MANAGE THE ERROR WITH ARRAY AND NOT CATCH
var Validator = require('validator').Validator;
// USE THE CACHE LIBARY (See HOW IT WORKS)
var cache = require('../lib/cache');
var utils = require('../lib/utils');

function route(app) {

	app.get('/', function (req, res) { 

		if (req.session.info) {
			// add reveal window too
			utils.rendering(req.headers.host, 'index', req.session.connected, function callback(objects) {
				var theme = objects.theme, layout = objects.layout;
				res.render(theme, layout);
			});

		} else {
			utils.rendering(req.headers.host, 'index', req.session.connected, function callback(objects) {
				var theme = objects.theme, layout = objects.layout;
				res.render(theme, layout);
			});

		}
	} );

	app.get('/themes', utils.restricted, function (req, res) { 

		var themes_find = new ModelsBase(req.headers.host);
		themes_find.find({}, function callback(results) {

			utils.rendering(req.headers.host, 'themes', req.session.connected, function callback(objects) {
				var theme = objects.theme, layout = objects.layout;
				layout.data = results;
				res.render(theme, layout);
			});
		});
	} );
	app.post('/themes', utils.restricted, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.path, 'path').notEmpty();
		validator.check(req.body.record, 'record').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
			utils.rendering(req.headers.host, 'themes', req.session.connected, function callback(objects) {
				var theme = objects.theme, layout = objects.layout;
				layout.message = 'Required fields: '+errors,
				layout.path = req.body.path,
				layout.record = req.body.record;
				res.render(theme, layout);
			});
		} else {
			var theme_insert = new ModelsBase(req.headers.host);
			var value = { path: req.body.path, record: req.body.record };
			theme_insert.insert(value, function callbacks(results) {
				utils.rendering(req.headers.host, 'themes', req.session.connected, function callback(objects) {
					var theme = objects.theme, layout = objects.layout;
					layout.form = false;
					layout.data = results;
					res.render(theme, layout);
				});

			});			
		}
	} );


	app.get('/invalid', function (req, res) {
		res.send("<center>You request isn't valid, contact: ...</center>", 404);
	} );

	app.get('/status', function (req, res) {
		res.send("HI", 200);
	} );

}

exports.route = route
