/* SKEL MODULE CONTROLLER
	Author: Andrea Di Mario
	Version: 0.0.0
	Description: The standard for the module
*/

// INCLUDE THE LIBRARY
var router = require('../lib/route66');
var utils = require('../lib/utils');
var ModelsSkel = require('../models/skel');

function route() {

	router.get('/skel/install/:operation?', utils.restricted, function (req, res) { 
		if (req.session.info.role === 'admin') {
			// DEFINE THE ACTIVE AND INACTIVE OPERATION FOR THE MODULE
			if (req.params.operation === "inactive") {
				// INSERT MODULE
				var value = {
					type: "module",
					name: "skel",
					acl: "admin"
				};
				// INSTANCE THE CLASS
				var Skel = new ModelsSkel(req.headers.host);
				Skel.insert(value, function callback(results) {

				}); 
				// INSERT MENU
				var value = {
					type: "menu", 
					path: "/skel", 
					item: "Skel",
					acl: "admin"
				};
				var Skel = new ModelsSkel(req.headers.host);
				Skel.insert(value, function callback(results) {

				}); 
				// RENDERING
                       		var data = {
                       	        	message: {action: 'success', message: 'Done, wait some seconds for cache refresh'},
               		        };
				utils.rendering(req.headers.host, 'module', data, req.session.info, function callback(layout){
                                	res.end(layout);
       	                	});

			} else if (req.params.operation === "active") {
				// REMOVE MODULE
				var value = {
					type: "module",
					name: "skel",
				};
				var Skel = new ModelsSkel(req.headers.host);
				Skel.remove(value, function callback(results) {

				}); 
				// REMOVE MENU
				var value = {
					type: "menu", 
					path: "/skel", 
					item: "Skel",
				};
				var Skel = new ModelsSkel(req.headers.host);
				Skel.remove(value, function callback(results) {

				}); 

                       		var data = {
                       	        	message: {action: 'success', message: 'Done, wait some seconds for cache refresh'},
               		        };
				utils.rendering(req.headers.host, 'module', data, req.session.info, function callback(layout){
                                	res.end(layout);
       	                	});

			}
		}
	});
	
}

exports.route = route;
