/* MuContent - BASE CONTROLLER FOR BASIC ADMINISTRATION
	Manage: language, themes, content, page, menu
*/

var router = require('route66');
// THIS SOLVED THE BUG ON ROUTE66: https://github.com/vdemedes/route66/issues/4
router.autosort = false;
var ModelsBase = require('../models/base.js');
// REQUIRE CLASS TO MANAGE THE ERROR WITH ARRAY AND NOT CATCH
var Validator = require('validator').Validator;
var cache = require('../lib/cache');
var utils = require('../lib/utils');
var fs = require('fs');
var Config = require('../config');

var configuration = new Config();

function route() {

	router.get('/', utils.maintenance, function (req, res) {
		//set language to default
		if (!req.session.lang) {
			req.session.lang = 0;
		}
		utils.rendering(req.headers.host, 'index', {}, req.session.info, req.session.lang, {}, function callback(layout) {
			res.end(layout);
		});

	} );

	router.get('/themes', utils.restricted_module, utils.restricted, function (req, res) { 
		var themes_find = new ModelsBase(req.headers.host);
		themes_find.find({type: 'theme'}, function callback(results) {
			var data = {
				form: {form_themes: true},
				content: results[0].html
			};
			utils.rendering(req.headers.host, 'themes', data, req.session.info, req.session.lang, {}, function callback(layout) {
				res.end(layout);
			});
		});
	} );
	router.post('/themes', utils.restricted_module, utils.restricted, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.content, 'content').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
                        var message = {
                                action: 'error',
                                reference: 'required',
                                value: errors
                        };
			var data = { 
				content: req.body.content
			}
			utils.rendering(req.headers.host, 'themes', data, req.session.info, req.session.lang, message, function callback(layout) {
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
                        	var message = {
                        	        action: 'success',
                	                reference: 'waitrefresh',
        	                        value: ''
	                        };
				var data = {
					form: {form_themes: true},
					content: results.html,
				};
				utils.rendering(req.headers.host, 'themes', data, req.session.info, req.session.lang, message, function callback(layout) {
					res.end(layout);
				});

			});			
		}
	} );

	router.get('/page/:operation?/:item?', utils.restricted_module, utils.restricted, function (req, res) { 
		if (req.params.operation === "new") {
			var data = { 
				type: 'new'
			};
			utils.rendering(req.headers.host, 'page', data, req.session.info, req.session.lang, {}, function callback(layout) {
				res.end(layout);
			});
		} else {
			var value = {};
			if (req.params.path) {
				value = {
					type: 'page',
					method: req.params.item 
				}
			} else {
				value = {
					type: 'page'
				}
			}
			var page_find = new ModelsBase(req.headers.host);
			page_find.find(value, function callback(results) {
				if (req.params.operation === "edit") {
					var data = {
						type: 'edit',
						method: results[0].method,
						pathtitle: results[0].pagetitle,	
						formoption: results[0].form,
						contentoption: results[0].content,
						headeroption: results[0].header,
						revealoption: results[0].reveal,
						sidebaroption: results[0].sidebar,
						footeroption: results[0].footer
					}
					utils.rendering(req.headers.host, 'page', data, req.session.info, req.session.lang, {}, function callback(layout) {
						res.end(layout);
					});
				
				} else {
					var data = {
						form: {form_page: false},
						data_page_new: true,
						data_page: results
					};
					utils.rendering(req.headers.host, 'page', data, req.session.info, req.session.lang, {}, function callback(layout) {
						res.end(layout);
					});
				}
			});
		}
	} );
	router.post('/page', utils.restricted_module, utils.restricted, function (req, res) { 
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
                       	var message = {
                      	        action: 'error',
               	                reference: 'required',
       	                        value: errors
                        };
			var data = { 
				method: req.body.method,
				pathtitle: req.body.pathtitle,					
				formoption: req.body.formoption,
				headeroption: req.body.headeroption,
				revealoption: req.body.revealoption,
				sidebaroption: req.body.sidebaroption,
				footeroption: req.body.footeroption
			}
			utils.rendering(req.headers.host, 'page', data, req.session.info, req.session.lang, message,function callback(layout) {
				res.end(layout);
			});
		} else {
			if (req.body.type === "edit") {
				var path_update = new ModelsBase(req.headers.host);
				var find = { 
					type: 'page',
					method: req.body.method
				};
				var value = {
					pagetitle: req.body.pathtitle,					
					form: req.body.formoption,
					content: req.body.contentoption,
					header: req.body.headeroption,
					reveal: req.body.revealoption,
					sidebar: req.body.sidebaroption,
					footer: req.body.footeroption
				}				
				path_update.update(find, value, function callbacks(results) {
                       			var message = {
                	      		       action: 'success',
 	              		               reference: 'waitrefresh',
       		 	                       value: ''
	                	        };
					var data = {
						form: {form_path: false},
					};
					utils.rendering(req.headers.host, 'page', data, req.session.info, req.session.lang, message, function callback(layout) {
						res.end(layout);
					});

				});
			} else if (req.body.type === "new") {
				var path_insert = new ModelsBase(req.headers.host);
				var value = {
					type: 'page',
					method: req.body.method,
					pagetitle: req.body.pathtitle,					
					form: req.body.formoption,
					content: req.body.contentoption,
					header: req.body.headeroption,
					reveal: req.body.revealoption,
					sidebar: req.body.sidebaroption,
					footer: req.body.footeroption
				}				
				path_insert.insert(value, function callbacks(results) {
                       			var message = {
                	      		       action: 'success',
 	              		               reference: 'waitrefresh',
       		 	                       value: ''
	                	        };
					var data = {
						form: {form_path: false},
					};
					utils.rendering(req.headers.host, 'page', data, req.session.info, req.session.lang, message, function callback(layout) {
						res.end(layout);
					});

				});

			}			
		}
	} );

	router.get('/menu/:operation?/:item?', utils.restricted_module, utils.restricted, function (req, res) { 
		if (req.params.operation === "new") {
			var data = { 
				type: 'new'
			};

			utils.rendering(req.headers.host, 'menu', data, req.session.info, req.session.lang, {}, function callback(layout) {
				res.end(layout);
			});

		} else {
			var value = {};
			if (req.params.item) {
				value = {
					type: 'menu',
					tag: req.params.item
				}
			} else {
				value = {
					type: 'menu'
				}
			}
			var menu_find = new ModelsBase(req.headers.host);
			menu_find.find(value, function callback(results) {
				if (req.params.operation === "edit") {

					var data = {
						type: 'edit',
						pathvalue: results[0].path,
						itemvalue: results[0].item,
						position: results[0].position,
						acl: results[0].acl
					}
					utils.rendering(req.headers.host, 'menu', data, req.session.info, req.session.lang, {}, function callback(layout) {
						res.end(layout);
					});
				} else {
					var data = {
						form: {form_menulist: false},
						data_menulist_new: true,
						data_menulist: results
					};
					utils.rendering(req.headers.host, 'menu', data, req.session.info, req.session.lang, {}, function callback(layout) {
						res.end(layout);
					});
				}
			});
		}
	} );
	router.post('/menu', utils.restricted_module, utils.restricted, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.pathvalue, 'path').notEmpty();
		validator.check(req.body.itemvalue, 'item').notEmpty();
		validator.check(req.body.position, 'position').notEmpty();
		validator.check(req.body.acl, 'acl').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
               		var message = {
              		       action: 'error',
      		               reference: 'required',
 	                       value: errors
	                };
			var data = { 
				pathvalue: req.body.pathvalue,
				itemvalue: req.body.itemvalue,
				position: req.body.position,
				acl: req.body.acl
			}
			utils.rendering(req.headers.host, 'menu', data, req.session.info, req.session.lang, message, function callback(layout) {
				res.end(layout);
			});
		} else {
			if (req.body.type === "new") {
				var menu_insert = new ModelsBase(req.headers.host);
				var value = {
					type: 'menu',
					path: req.body.pathvalue,
					item: req.body.itemvalue,
					position: req.body.position,
					acl: req.body.acl
				}				
				menu_insert.insert(value, function callbacks(results) {
        	       			var message = {
              				       action: 'success',
      				               reference: 'waitrefresh',
 		                	       value: ''
		         	       };
					var data = {
						form: {form_menulist: false},
					};
					utils.rendering(req.headers.host, 'menu', data, req.session.info, req.session.lang, message, function callback(layout) {
						res.end(layout);
					});

				});			

			} else if (req.body.type === "edit") {

				var menu_update = new ModelsBase(req.headers.host);
				var find = { 
					type: 'menu',
					path: req.body.pathvalue
				};
				var value = {
					item: req.body.itemvalue,
					position: req.body.position,
					acl: req.body.acl
				}				
				menu_update.update(find, value, function callbacks(results) {
        	       			var message = {
              				       action: 'success',
      				               reference: 'waitrefresh',
 		                	       value: ''
		         	       };
					var data = {
						form: {form_menulist: false},
					};
					utils.rendering(req.headers.host, 'menu', data, req.session.info, req.session.lang, message, function callback(layout) {
						res.end(layout);
					});

				});			
			}
		}
	} );

	router.get('/submenu/:operation?/:item?', utils.restricted_module, utils.restricted, function (req, res) { 
		if (req.params.operation === "new") {
			var data = { 
				type: 'new'
			};

			utils.rendering(req.headers.host, 'submenu', data, req.session.info, req.session.lang, {}, function callback(layout) {
				res.end(layout);
			});


		} else {
			var value = {};
			if (req.params.item) {
				value = {
					type: 'submenu',
					tag: req.params.item
				}
			} else {
				value = {
					type: 'submenu'
				}
			}
			var submenu_find = new ModelsBase(req.headers.host);
			submenu_find.find(value, function callback(results) {
				if (req.params.operation === "edit") {
	
					var data = {
						type: 'edit',
						pathvalue: results[0].submenu_path,
						itemvalue: results[0].submenu_item,
						position: results[0].position,
						parent_position: results[0].parent_position,
						acl: results[0].acl
					}
					utils.rendering(req.headers.host, 'submenu', data, req.session.info, req.session.lang, {}, function callback(layout) {
						res.end(layout);
					});
				} else {
					var data = {
						form: {form_submenulist: false},
						data_submenulist_new: true,
						data_submenulist: results
					};
					utils.rendering(req.headers.host, 'submenu', data, req.session.info, req.session.lang, {}, function callback(layout) {
						res.end(layout);
					});
				}
			});
		}
	} );
	router.post('/submenu', utils.restricted_module, utils.restricted, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.pathvalue, 'path').notEmpty();
		validator.check(req.body.itemvalue, 'item').notEmpty();
		validator.check(req.body.position, 'position').notEmpty();
		validator.check(req.body.parent_position, 'parent_position').notEmpty();
		validator.check(req.body.acl, 'acl').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
               		var message = {
              		       action: 'error',
      		               reference: 'required',
 	                       value: errors
	                };
			var data = { 
				pathvalue: req.body.pathvalue,
				itemvalue: req.body.itemvalue,
				position: req.body.position,
				parent_position: req.body.parent_position,
				acl: req.body.acl
			}
			utils.rendering(req.headers.host, 'submenu', data, req.session.info, req.session.lang, message, function callback(layout) {
				res.end(layout);
			});
		} else {
			if (req.body.type === "new") {
				var submenu_insert = new ModelsBase(req.headers.host);
				var value = {
					type: 'submenu',
					submenu_path: req.body.pathvalue,
					submenu_item: req.body.itemvalue,
					position: req.body.position,
					parent_position: req.body.parent_position,
					acl: req.body.acl
				};				
				submenu_insert.insert(value, function callbacks(results) {
        	       			var message = {
              				       action: 'success',
      				               reference: 'waitrefresh',
 		                	       value: ''
		                	};
					var data = {
						form: {form_submenulist: false},
						data_submenulist: results,
						data_submenulist_new: true
					};
					utils.rendering(req.headers.host, 'submenu', data, req.session.info, req.session.lang, message, function callback(layout) {
						res.end(layout);
					});

				});			

			} else if (req.body.type === "edit") {
				var submenu_update = new ModelsBase(req.headers.host);
				var find = { 
					type: 'submenu',
					submenu_path: req.body.pathvalue
				};
				var value = {
					submenu_item: req.body.itemvalue,
					position: req.body.position,
					parent_position: req.body.parent_position,
					acl: req.body.acl
				};				
				submenu_update.update(find, value, function callbacks(results) {
        	       			var message = {
              				       action: 'success',
      				               reference: 'waitrefresh',
 		                	       value: ''
		                	};
					var data = {
						form: {form_submenulist: false},
						data_submenulist: results,
						data_submenulist_new: true
					};
					utils.rendering(req.headers.host, 'submenu', data, req.session.info, req.session.lang, message, function callback(layout) {
						res.end(layout);
					});

				});			
			}
		}
	} );

	router.get('/module/:operation?', utils.restricted_module, utils.restricted, function (req, res) { 
		fs.readdir(__dirname, function (err, files) {
			var value = [], modules = [];
			// get active from cache
			var information = cache.get(req.headers.host);
			information.forEach( function (row) {
				if ((configuration.Params.default_path.indexOf(row.name) == -1) && (row.type === "module")) {
					modules.push({value: row.name, status: 'active'});
				}
			// get all modules and put only inactive
			});
        		files.forEach(function(item) {
				var module = item.split('.')[0];
				if (configuration.Params.default_controller.indexOf(module) == -1) {
					var find = false;
					modules.forEach( function (line) {
						if (line.value === module)
							find = true;
					});
					if (find == false) {
						modules.push({value: module, status: 'inactive'});
					}
				}
        		});

			var data = {data_modules: modules};
			utils.rendering(req.headers.host, 'module', data, req.session.info, req.session.lang, {}, function callback(layout) {
				res.end(layout);
			});
		});

	} );

	router.get('/language/:operation?/:value?', utils.restricted_module, utils.restricted, function (req, res) { 
		var data = {}, message = {};
		if (req.params.operation === "new") {
			var data = {
				form: {form_language: true}
			};
			utils.rendering(req.headers.host, 'language', data, req.session.info, req.session.lang, message, function callback(layout) {
				res.end(layout);
			});

		} else if (req.params.operation === "delete" ) {
			var value = { 
				type: 'language',
				lang_id: req.params.value
			};
			var language_remove = new ModelsBase(req.headers.host);
			language_remove.remove(value, function callback(results) {

			});
                        message = {
                                 action: 'success',
                                 reference: 'deleted',
                                 value: ''
                        };
			utils.rendering(req.headers.host, 'language', data, req.session.info, req.session.lang, message, function callback(layout) {
				res.end(layout);
			});
		} else {
			var value = { type: 'language' };
			var language_find = new ModelsBase(req.headers.host);
			language_find.find(value, function callback(results) {

				data = {
					form: {form_language: false},
					data_language_new: true,
					data_language:  results
				};
				utils.rendering(req.headers.host, 'language', data, req.session.info, req.session.lang, message, function callback(layout) {
					res.end(layout);
				});
			});
		}
	} );
	router.post('/language', utils.restricted_module, utils.restricted, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.lang_name, 'lang_name').notEmpty();
		validator.check(req.body.lang_id, 'lang_id').notEmpty().isNumeric();
		var errors = validator.getErrors();
		if (errors.length)
		{
               		var message = {
         		       action: 'error',
		               reference: 'required',
	                       value: errors
	                };
			var data = { 
				lang_name: req.body.lang_name,
				lang_id: req.body.lang_id
			}
			utils.rendering(req.headers.host, 'language', data, req.session.info, req.session.lang, message, function callback(layout) {
				res.end(layout);
			});
		} else {
			var language_insert = new ModelsBase(req.headers.host);
			var value = { 
				type: 'language',
				lang_id: req.body.lang_id,
				lang_name: req.body.lang_name
			};
			language_insert.insert(value, function callbacks(results) {
               			var message = {
         			       action: 'success',
			               reference: 'waitrefresh',
		                       value: ''
		                };
				var data = {
					form: {form_language: false},
					data_language:  true,
					lang_name: results[0].lang_name,
					lang_id: results[0].lang_id
				};
				utils.rendering(req.headers.host, 'language', data, req.session.info, req.session.lang, message, function callback(layout) {
					res.end(layout);
				});

			});			
		}
	} );

	router.get('/content/:operation?/:type?/:tag?/:lang_id?', utils.restricted_module, utils.restricted, function (req, res) { 
		var data = {}, message = {};
		if (req.params.operation === "new") {
			data = {
				form: {form_content: true, operation: 'new'},
			};
			utils.rendering(req.headers.host, 'content', data, req.session.info, req.session.lang, message, function callback(layout) {
				res.end(layout);
			});

		} else if (req.params.operation === "delete" ) {
			var value = { 
				tag: req.params.tag,
				lang_id: req.params.lang_id
			};
			var content_remove = new ModelsBase(req.headers.host);
			content_remove.remove_content(value, function callback(results) {

			});
                       	message = {
                       	         action: 'success',
                       	         reference: 'deleted',
                       	         value: ''
                       	};
			utils.rendering(req.headers.host, 'content', {}, req.session.info, req.session.lang, message, function callback(layout) {
				res.end(layout);
			});
		} else if (req.params.operation === "edit" ) {
			data = {
				form: {form_content: true, operation: 'edit'}, 
				type: req.params.type,
				tag: req.params.tag,
				lang_id: req.params.lang_id
			};
			utils.rendering(req.headers.host, 'content', data, req.session.info, req.session.lang, message, function callback(layout) {
				res.end(layout);
			});

		} else {
			var value = {};
			var content_find = new ModelsBase(req.headers.host);
			content_find.find_content(value, function callback(results) {

				data = {
					form: {form_content: false},
					data_content_new: true,
					data_content:  results
				};
				utils.rendering(req.headers.host, 'content', data, req.session.info, req.session.lang, message, function callback(layout) {
					res.end(layout);
				});
			});
		}
	} );
	router.post('/content', utils.restricted_module, utils.restricted, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.type, 'type').notEmpty();
		validator.check(req.body.tag, 'tag').notEmpty();
		validator.check(req.body.lang_id, 'lang_id').notEmpty().isNumeric();
		validator.check(req.body.text, 'text').notEmpty();
		var errors = validator.getErrors();
		if (errors.length)
		{
               		var message = {
         		       action: 'error',
		               reference: 'required',
	                       value: errors
	                };
			var data = { 
				type: req.body.type,
				tag: req.body.tag,
				text: req.body.text,
				lang_id: req.body.lang_id
			}
			utils.rendering(req.headers.host, 'content', data, req.session.info, req.session.lang, message, function callback(layout) {
				res.end(layout);
			});
		} else {
			if (req.body.operation === 'new') {
				var content_insert = new ModelsBase(req.headers.host);
				var value = { 
					type: req.body.type,
					tag: req.body.tag,
					lang_id: req.body.lang_id,
					text: req.body.text
				};
				content_insert.insert_content(value, function callbacks(results) {
               				var message = {
         				       action: 'success',
			        	       reference: 'waitrefresh',
		                       	       value: ''
			                };
					var data = {
						form: {form_content: false},
						data_content:  results,
					};
					utils.rendering(req.headers.host, 'content', data, req.session.info, req.session.lang, message, function callback(layout) {
						res.end(layout);
					});
				});			
	
			} else if (req.body.operation === "edit" ) {
				var find = {
					type: req.body.type,
					tag: req.body.tag,
					lang_id: req.body.lang_id
				};
				var value = { 
					text: req.body.text
				};
				var content_update = new ModelsBase(req.headers.host);
				content_update.update_content(find, value, function callback(results) {
					data = results;
	                	        message = {
        	                	         action: 'success',
                                 		 reference: 'waitrefresh',
	                                	 value: ''
        	                	};
					utils.rendering(req.headers.host, 'content', data, req.session.info, req.session.lang, message, function callback(layout) {
						res.end(layout);
					});

				});
			}		
		}
	} );


// not language or similar for routing, to limit conflict with language route above
	router.post('/locales', function (req, res) {
console.log(req.body.choosed_lang);
		req.session.lang = req.body.choosed_lang;
		res.writeHead(302, {
                	'Location': '/'
                });
		res.end();
	} );

	router.get('/invalid', function (req, res) {
		res.writeHead(404, "Content-type: text/html");
		res.end(configuration.Params.invalid_request);
	} );

	router.get('/status', function (req, res) {
		res.writeHead(200, "Content-type: text/html");
		res.end("HI");
	} );

// THIS ROUTE IS USED TO GET STATIC PAGE FROM DB OR SEND A 404 OR HOME PAGE
	router.get('/:staticpage?', utils.maintenance, utils.restricted, function (req, res) {
		var information = cache.get(req.headers.host), find = false;
		information.forEach( function (row) {
			if ((row.type === "page") && (row.method === req.params.staticpage)) {
				find = true;
				utils.rendering(req.headers.host, req.params.staticpage, {}, req.session.info, req.session.lang, {}, function callback(layout) {
					res.end(layout);
				});
			}
		});
		if (!find && req.params.staticpage) {
			utils.rendering(req.headers.host, '404', {}, req.session.info, req.session.lang, {}, function callback(layout) {
				res.end(layout);
			});
		}

	} );

}

exports.route = route
