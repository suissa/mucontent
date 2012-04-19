/* USER CONTROLLER 
*/

var ModelsUser = require('../models/user.js');
// REQUIRE CLASS TO MANAGE THE ERROR WITH ARRAY AND NOT CATCH
var Validator = require('validator').Validator;
var cache = require('../lib/cache');
var utils = require('../lib/utils');

Validator.prototype.error = function (msg) {
    this._errors.push(msg);
}

Validator.prototype.getErrors = function () {
    return this._errors;
}

function route(app) {

	app.get('/logout', utils.restricted, function (req, res) { 
 		req.session.destroy(function(err){
			if (err){
				utils.quicklog(err);
			} 
		});
		utils.rendering(req.headers.host, 'login', false, function callback(objects) {
			var theme = objects.theme, layout = objects.layout;
			layout.pagetitle = "Logout";
			layout.form = false;
			layout.message = "Disconnesso";
			res.render(theme, layout);
		});

	} );


	app.get('/login', utils.auth_yet, function (req, res) { 
		if (req.session.info) {
			utils.rendering(req.headers.host, 'login', req.session.connected, function callback(objects) {
				var theme = objects.theme, layout = objects.layout;
				layout.form = false;
				layout.message = "Connesso " + req.session.info[0].name;
				res.render(theme, layout);
			});
		} else {
			utils.rendering(req.headers.host, 'login', req.session.connected,function callback(objects) {
				var theme = objects.theme, layout = objects.layout;
				res.render(theme, layout);
			});
		}
	} );
	app.post('/login', utils.auth_yet, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.name, 'name').notEmpty();
		validator.check(req.body.password, 'password').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
			utils.rendering(req.headers.host, 'login', req.session.connected, function callback(objects) {
				var theme = objects.theme, layout = objects.layout;
				layout.message = 'Required fields: ' + errors;
				layout.name = req.body.name;
				res.render(theme, layout);
			});
		} else {
			var user_login = new ModelsUser(req.headers.host);
			var value = {name: req.body.name, password: req.body.password};
			user_login.login(value, function callbacks(results) {
				// ISSUE 6: MISSING CHECK ON OBJECTS
				if (results.length != 0) {
					var connected=true;
					req.session.connected = connected;
					req.session.info = results;
// if i don't use this temp variable the objects are overwrited by rendering function
					utils.rendering(req.headers.host, 'login', req.session.connected, function callback(objects) {
						var theme = objects.theme, layout = objects.layout;
						layout.form = false;
						layout.user = true;
						layout.data = results;
						res.render(theme, layout);
					});

				} else {
					utils.rendering(req.headers.host, 'login', req.session.connected, function callback(objects) {
						var theme = objects.theme, layout = objects.layout;
						layout.message = 'Non trovato';
						res.render(theme, layout);
					});
				}
			});
		}
	} );


	app.get('/registration', utils.auth_yet, function (req, res) { 
		utils.rendering(req.headers.host, 'registration', req.session.connected, function callback(objects) {
			var theme = objects.theme, layout = objects.layout;
			res.render(theme, layout);
		});
	} );
	app.post('/registration', utils.auth_yet, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.name, 'name').notEmpty();
		validator.check(req.body.email, 'email').isEmail();
		validator.check(req.body.password, 'password').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
			utils.rendering(req.headers.host, 'registration', req.session.connected, function callback(objects) {
				var theme = objects.theme, layout = objects.layout;
				layout.message = 'Required fields: ' + errors;
				layout.name = req.body.name;
				layout.email = req.body.email;
				res.render(theme, layout);
			});
		} else {
			// ONLY ONE USERNAME
			var user_check = new ModelsUser(req.headers.host);
			var value = {name: req.body.name};
			user_check.find(value, function callbacks(results) {
				// CHECK IF THERE ARE OTHER USER
				if (results.length == 0) {
					var user_insert = new ModelsUser(req.headers.host);
					var value = {
						name: req.body.name, 
						email: req.body.email, 
						password: req.body.password
					};
					user_insert.insert(value, function callbacks(results) {
						utils.rendering(req.headers.host, 'registration', req.session.connected, function callback(objects) {
							var theme = objects.theme, layout = objects.layout;
							layout.form = false;
							layout.user = true;
							layout.data = results;
							res.render(theme, layout);
						});
					});
				} else { 
					utils.rendering(req.headers.host, 'registration', req.session.connected, function callback(objects) {
						var theme = objects.theme, layout = objects.layout;
						layout.message = 'User already in database';
						layout.name = req.body.name;
						layout.email = req.body.email;
						res.render(theme, layout);
					});
				}

			}); 

		}
	} );

	app.get('/user/:operation?/:name?', utils.restricted, function (req, res) {
		if (req.params.name){
			if ((req.session.info[0].role === "admin") || (req.params.name == req.session.info[0].name)) {
				var value = {name: req.params.name};
			} else {
				utils.rendering(req.headers.host, '404', req.session.connected, function callback(objects) {
					var theme = objects.theme, layout = objects.layout;
					res.render(theme, layout);
				});
			}

		} else {
			if (req.session.info[0].role === "admin"){
				var value = {};
			} else {
				res.redirect('/user/view/'+req.session.info[0].name);
			}

		}			
		var user_list = new ModelsUser(req.headers.host);
		user_list.find(value, function callbacks(results) {
			utils.rendering(req.headers.host, 'index', req.session.connected, function callback(objects) {
				var theme = objects.theme, layout = objects.layout;
				if (req.params.operation === "edit") {
					layout.form = true;
					layout.user = true;
					layout.registration = true;
					layout.type = "user";
					layout.name = results[0].name;
					layout.email = results[0].email;
					layout.password = results[0].password;
				} else if ((req.params.operation === "new") && (req.session.info[0].role == "admin")) {
					layout.form = true;
					layout.user = true;
					layout.type = "user";
					layout.registration = true;
					layout.restricted = true;
				} else {
					layout.user = true;
					layout.data = results;
				}
				res.render(theme, layout);
			});
		}); 
	} );
	app.post('/user', utils.restricted, function (req, res) {
// could be only edit, not change username else 404
		if ((req.session.info[0].role === "admin") || (req.body.name == req.session.info[0].name)) {
			var validator = new Validator();   
			validator.check(req.body.name, 'name').notEmpty();
			validator.check(req.body.email, 'email').isEmail();
			validator.check(req.body.password, 'password').notEmpty();
			var errors = validator.getErrors();
			if (errors.length)
			{
				utils.rendering(req.headers.host, '/user', req.session.connected, function callback(objects) {
					var theme = objects.theme, layout = objects.layout;
					layout.message = 'Required fields: ' + errors;
					layout.name = req.body.name;
					layout.email = req.body.email;
					res.render(theme, layout);
				});
			} else {
				var user_edit = new ModelsUser(req.headers.host);
				var value = {
					name: req.body.name, 
					email: req.body.email, 
					password: req.body.password
				};
				user_edit.update(value, function callbacks(results) {
					utils.rendering(req.headers.host, '/user', req.session.connected, function callback(objects) {
						var theme = objects.theme, layout = objects.layout;
						layout.form = false;
						layout.user = true;
						layout.data = results;
						res.render(theme, layout);
					});
				});
			}
		} else {
			utils.rendering(req.headers.host, '404', req.session.connected, function callback(objects) {
				var theme = objects.theme, layout = objects.layout;
				layout.message = "Remember that you can't change username";
				res.render(theme, layout);
			});
		}
	} );

}

exports.route = route;
