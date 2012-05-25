/* USER CONTROLLER 
*/

var router = require('../lib/route66');
var ModelsUser = require('../models/user.js');
// REQUIRE CLASS TO MANAGE THE ERROR WITH ARRAY AND NOT CATCH
var Validator = require('validator').Validator;
var cache = require('../lib/cache');
var utils = require('../lib/utils');
var crypto = require('crypto');


Validator.prototype.error = function (msg) {
    this._errors.push(msg);
}

Validator.prototype.getErrors = function () {
    return this._errors;
}

function route() {

	router.get('/logout', utils.restricted, function (req, res) { 
		var lang = req.session.lang;
 		req.session.destroy(function(err){
			if (err){
				utils.quicklog(err);
			} 
		});
		var message = {
			action: 'success', 
			reference: 'disconnected',
			value: ''
		};
		var data = { 
			pagetitle: "Logout",
			form: false,
		};
		utils.rendering(req.headers.host, 'login', data, false, lang, message, function callback(layout) {
			res.end(layout);
		});

	} );


	router.get('/login', utils.auth_yet, function (req, res) { 
		if (req.session.info) {
			var message = {
				action: 'success', 
				reference: 'connected',
				value: req.session.info.name
			};
			var data = { 
				form: false}
			utils.rendering(req.headers.host, 'login', data, req.session.info, req.session.lang, message, function callback(layout) {
				res.end(layout);
			});
		} else {
			utils.rendering(req.headers.host, 'login', {}, req.session.info, req.session.lang, {}, function callback(layout) {
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
			var message = {
				action: 'error', 
				reference: 'required',
				value: errors
			};
			var data = { name: req.body.name}
			utils.rendering(req.headers.host, 'login', data, req.session.info, req.session.lang, message, function callback(layout) {
				res.end(layout);
			});
		} else {
			var user_login = new ModelsUser(req.headers.host);
  			var shasum = crypto.createHash('sha1');
			shasum.update(req.body.password);
			var value = {
				name: req.body.name, 
				password: shasum.digest('hex')
			};
			user_login.login(value, function callbacks(results) {
				// ISSUE 6: MISSING CHECK ON OBJECTS
				if (results.length != 0) {
					req.session.info = {
						name: results[0].name,
						role: results[0].role
					}
// if i don't use this temp variable the objects are overwrited by rendering function
					var message = {
						action: 'success', 
						reference: 'connected',
						value: results[0].name
					};
					var data = { form: {form_user: false}}
					utils.rendering(req.headers.host, 'login', data, req.session.info, req.session.lang, message, function callback(layout) {
						res.end(layout);
					});

				} else {
					var message = {
						action: 'error', 
						reference: 'notfound',
						value: ''
					};
					utils.rendering(req.headers.host, 'login', {}, req.session.info, req.session.lang, message, function callback(layout) {
						res.end(layout);
					});
				}
			});
		}
	} );


	router.get('/registration', utils.auth_yet, function (req, res) { 
		var data = {};
		if (req.session.info && (req.session.info.role == "admin")) {
			data = { 
				form: { form_user: true,
				type: 'registration',
				registration: true,
				restricted: true}
			};
		}
		utils.rendering(req.headers.host, 'registration', data, req.session.info, req.session.lang, {}, function callback(layout) {
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
			var message = {
				action: 'error', 
				reference: 'required',
				value: errors
			};
			var data = { 
				name: req.body.name,
				email: req.body.email
			};
			utils.rendering(req.headers.host, 'registration', data, req.session.info, req.session.lang, message, function callback(layout) {
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
  					var shasum = crypto.createHash('sha1');
					shasum.update(req.body.password);
					var value = {
						name: req.body.name, 
						email: req.body.email, 
						role: 'user',
						password: shasum.digest('hex')
					};
					user_insert.insert(value, function callbacks(results) {
						var message = {
							action: 'success', 
							reference: 'registrated',
							value: ''
						};
						var data = { 
							form: {form_user: false},
							data_user: results
						};
						utils.rendering(req.headers.host, 'registration', data, req.session.info, req.session.lang, message, function callback(layout) {
							res.end(layout);
						});
					});
				} else {
					var message = {
						action: 'warning', 
						reference: 'alreadyexists',
						value: errors
					};
					var data = {
						name: req.body.name,
						email: req.body.email
					};
					utils.rendering(req.headers.host, 'registration', data, req.session.info, req.session.lang, message, function callback(layout) {
						res.end(layout);
					});
				}

			}); 

		}
	} );

	router.get('/user/:operation?/:name?', utils.restricted, function (req, res) {
		if (req.params.name){
			if ((req.session.info.role === "admin") || (req.params.name == req.session.info.name)) {
				var value = {name: req.params.name};
			} else {
				utils.rendering(req.headers.host, '404', {}, req.session.info, req.session.lang, {}, function callback(layout) {
					res.end(layout);
				});
			}

		} else {
			if (req.session.info.role === "admin"){
				var value = {};
			} else {
// redirect to right user
  				var location = '/user/view/'+req.session.info.name;
				res.writeHead(302, {
				  	'Location': location
				});
				res.end();
			}

		}		
		var data = {}, message = {};	
		var user_list = new ModelsUser(req.headers.host);
		user_list.find(value, function callbacks(results) {
			if (req.params.operation === "edit") {
				data = { 
					form: {form_user: true, registration: true},
					type: 'user',
					name: results[0].name,
					email: results[0].email,
					password: results[0].password
				};
				if (req.session.info.role == "admin") {
					data.form.restricted = true;
					data.role = results[0].role;
				}
			} else if ((req.params.operation === "delete") && (req.session.info.role == "admin")) {
				var value = {
					name: req.params.name
				};
				var user_remove = new ModelsUser(req.headers.host);
				user_remove.remove(value, function callbacks(results) {

				});
				message = {
					action: 'success', 
					reference: 'deleted',
					value: ''
				};
			} else {
				data = { 
					form: {form_user: false},
					data_user: results,
				};
				if (req.session.info.role == "admin") {
					data.data_user_new = true;
					data.restricted = true;
				}
				if (req.session.info.role) {
					data.user_edit = true;
				}
			}
			utils.rendering(req.headers.host, 'user', data, req.session.info, req.session.lang, message, function callback(layout) {
				res.end(layout);
			});
		}); 
	} );
	router.post('/user', utils.restricted, function (req, res) {
// could be only edit, not change username else 404
		if ((req.session.info.role === "admin") || (req.body.name == req.session.info.name)) {
			var validator = new Validator();   
			validator.check(req.body.name, 'name').notEmpty();
			validator.check(req.body.email, 'email').isEmail();
			validator.check(req.body.password, 'password').notEmpty();
			var errors = validator.getErrors();
			if (errors.length)
			{
				var message = {
					action: 'error', 
					reference: 'required',
					value: errors
				};
				var data = { 
					name: req.body.name,
					email: req.body.email
				};
				utils.rendering(req.headers.host, 'user', data, req.session.info, req.session.lang, message, function callback(layout) {
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
					utils.rendering(req.headers.host, 'user', data, req.session.info, req.session.lang, {}, function callback(layout) {
						res.end(layout);
					});
				});
			}
		} else {
			var message = {
				action: 'error', 
				reference: 'notchange',
				value: ''
			};
			utils.rendering(req.headers.host, '404', {}, req.session.info, req.session.lang, {}, function callback(layout) {
				res.end(layout);
			});
		}
	} );

}

exports.route = route;
