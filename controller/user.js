/* USER CONTROLLER 
*/

var router = require('route66');
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

function route() {

	router.get('/logout', utils.restricted, function (req, res) { 
 		req.session.destroy(function(err){
			if (err){
				utils.quicklog(err);
			} 
		});
		var data = { pagetitle: "Logout",
			form: false,
			message: 'Disconnesso'};
		utils.rendering(req.headers.host, 'login', data, false, function callback(layout) {
			res.end(layout);
		});

	} );


	router.get('/login', utils.auth_yet, function (req, res) { 
		if (req.session.info) {
			var data = { message: "Connesso " + req.session.info[0].name,
				form: false}
			utils.rendering(req.headers.host, 'login', data, req.session.connected, function callback(layout) {
				res.end(layout);
			});
		} else {
			utils.rendering(req.headers.host, 'login', {}, req.session.connected, function callback(layout) {
				res.end(layout);
			});
		}
	} );
	router.post('/login', utils.auth_yet, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.name, 'name').notEmpty();
		validator.check(req.body.password, 'password').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
			var data = { message: 'Required fields: ' + errors,
				name: req.body.name}
			utils.rendering(req.headers.host, 'login', data, req.session.connected, function callback(layout) {
				res.end(layout);
			});
		} else {
			var user_login = new ModelsUser(req.headers.host);
			var value = {name: req.body.name, password: req.body.password};
			user_login.login(value, function callbacks(results) {
				// ISSUE 6: MISSING CHECK ON OBJECTS
				if (results.length != 0) {
					var connected = true;
					req.session.connected = connected;
					req.session.info = results;
// if i don't use this temp variable the objects are overwrited by rendering function
					var data = { form: false,
						data_user: results}						
					utils.rendering(req.headers.host, 'login', data, req.session.connected, function callback(layout) {
						res.end(layout);
					});

				} else {
					var data = { message: 'Non trovato'}
					utils.rendering(req.headers.host, 'login', data, req.session.connected, function callback(layout) {
						res.end(layout);
					});
				}
			});
		}
	} );


	router.get('/registration', utils.auth_yet, function (req, res) { 
		utils.rendering(req.headers.host, 'registration', {}, req.session.connected, function callback(layout) {
			res.end(layout);
		});
	} );
	router.post('/registration', utils.auth_yet, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.name, 'name').notEmpty();
		validator.check(req.body.email, 'email').isEmail();
		validator.check(req.body.password, 'password').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
			var data = { message: 'Required fields: ' + errors,
				name: req.body.name,
				email: req.body.email}
			utils.rendering(req.headers.host, 'registration', data, req.session.connected, function callback(objects) {
				res.end(layout);
			});
		} else {
			// ONLY ONE USERNAME
			var user_check = new ModelsUser(req.headers.host);
			var value = { name: req.body.name };
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
						var data = { form: false,
//							user: true,
							data_user: results}
						utils.rendering(req.headers.host, 'registration', data, req.session.connected, function callback(layout) {
							res.end(layout);
						});
					});
				} else {
					var data = {message: 'User already exists',
						name: req.body.name,
						email: req.body.email}
					utils.rendering(req.headers.host, 'registration', req.session.connected, function callback(layout) {
						res.end(layout);
					});
				}

			}); 

		}
	} );

	router.get('/user/:operation?/:name?', utils.restricted, function (req, res) {
		if (req.params.name){
			if ((req.session.info[0].role === "admin") || (req.params.name == req.session.info[0].name)) {
				var value = {name: req.params.name};
			} else {
				utils.rendering(req.headers.host, '404', {}, req.session.connected, function callback(layout) {
					res.end(layout);
				});
			}

		} else {
			if (req.session.info[0].role === "admin"){
				var value = {};
			} else {
// redirect to right user
  				var location = '/user/view/'+req.session.info[0].name;
				res.writeHead(302, {
				  	'Location': location
				});
				res.end();
			}

		}		
		var data = {};	
		var user_list = new ModelsUser(req.headers.host);
		user_list.find(value, function callbacks(results) {
			if (req.params.operation === "edit") {
				data = { form: {registration: true, user: true},
					type: 'user',
					name: results[0].name,
					email: results[0].email,
					password: results[0].password};
			} else if ((req.params.operation === "new") && (req.session.info[0].role == "admin")) {
				data = { form: true,
					user: true,
					type: 'user',
					registration: true,
					restricted: true};
			} else {
				data = { form: {user: false},
					data_user: results};
			}
			utils.rendering(req.headers.host, 'user', data, req.session.connected, function callback(layout) {
				res.end(layout);
			});
		}); 
	} );
	router.post('/user', utils.restricted, function (req, res) {
// could be only edit, not change username else 404
		if ((req.session.info[0].role === "admin") || (req.body.name == req.session.info[0].name)) {
			var validator = new Validator();   
			validator.check(req.body.name, 'name').notEmpty();
			validator.check(req.body.email, 'email').isEmail();
			validator.check(req.body.password, 'password').notEmpty();
			var errors = validator.getErrors();
			if (errors.length)
			{
				var data = { message: 'Required fields: ' + errors,
					name: req.body.name,
					email: req.body.email}
				utils.rendering(req.headers.host, '/user', data, req.session.connected, function callback(layout) {
					res.end(layout);
				});
			} else {
				var user_edit = new ModelsUser(req.headers.host);
				var value = {
					name: req.body.name, 
					email: req.body.email, 
					password: req.body.password
				};
				user_edit.update(value, function callbacks(results) {
					var data = {data_user: results};
					utils.rendering(req.headers.host, '/user', data, req.session.connected, function callback(layout) {
						res.end(layout);
					});
				});
			}
		} else {
			var data = {message: "Remember that you can't change username"};
			utils.rendering(req.headers.host, '404', data, req.session.connected, function callback(layout) {
				res.end(layout);
			});
		}
	} );

}

exports.route = route;
