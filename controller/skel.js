/* MuContent - SKEL MODULE CONTROLLER
	Author: Andrea Di Mario
	Version: 0.0.0
	Description: The standard module structure
*/

// INCLUDE THE LIBRARY
var router = require('route66');
var utils = require('../lib/utils');
var ModelsSkel = require('../models/skel');

// CALL THE ROUTE (THE APP GET route() METHOD)
function route() {

	// DEFINE THE PATH
	router.get('/skel', utils.restricted, function (req, res) { 
			var message = {};
			utils.rendering(req.headers.host, 'skel', {}, req.session.info, req.session.lang, message, function callback(layout){
                               	res.end(layout);
	               	});

	});

	// THE INSTALL/UNINSTALL PATH
	router.get('/skel/install/:value?', utils.restricted, function (req, res) { 
		// ONLY ADMIN CAN DO THIS
		if (req.session.info.role === 'admin') {
			// DEFINE THE ACTIVE AND INACTIVE OPERATION FOR THE MODULE
			// IF MODULE IS INACTIVE THEN INSTALL IT
			if (req.params.value === "inactive") {
				// INSERT MODULE
				var value = {
					type: "module",
					name: "skel",
					acl: "admin"
				};
				// INSTANCE THE CLASS
				var Skel = new ModelsSkel(req.headers.host);
				// CALL THE METHOD WITH CALLBACK MANAGEMENT FOR RESULTS IF YOU NEED IT
				Skel.install(value, function callback(results) {

				}); 
				// INSERT MENU
				var value = {
					type: "menu", 
					path: "/skel", 
					tag: "skel",
					item: "Skel,",
					position: "11",
					acl: "admin"
				};
				var Skel = new ModelsSkel(req.headers.host);
				Skel.install(value, function callback(results) {

				}); 
				// INSERT PATH (PAGE)
				var value = {
					type: "page",
					method: "skel",
					pagetitle: "Skel,",
					header: true,
					reveal: false,
					sidebar: false,
					// SET IT TO ADD CONTENT INTO THEME WITH MUSTACHE
					content_skel: false,
					form: "{\"form_skel\":\"false\"}",
					footer: true
				};
				var Skel = new ModelsSkel(req.headers.host);
				Skel.install(value, function callback(results) {

				}); 

				// RENDERING
				// PASS A MESSAGE THAT RETURN THIS MESSAGE IS DEFINED IN "CONTENT" PAGE
				// DEFAULT IS waitrefresh
                                var message = {
                                       action: 'success',
                                       reference: 'waitrefresh',
                                       value: ''
                                };
				// CALL THE RENDERING METHOD FROM LIBRARY
				utils.rendering(req.headers.host, 'module', {}, req.session.info, req.session.lang, message, function callback(layout){
                                	res.end(layout);
       	                	});

			// IF MODULE IS INSTALLED, THEN UNINSTALL IT
			} else if (req.params.value === "active") {
				// REMOVE MODULE
				var value = {
					type: "module",
					name: "skel",
				};
				var Skel = new ModelsSkel(req.headers.host);
				Skel.uninstall(value, function callback(results) {

				}); 
				// REMOVE PATH
				var value = {
					type: "page",
					method: "skel",
				};
				var Skel = new ModelsSkel(req.headers.host);
				Skel.uninstall(value, function callback(results) {

				}); 
				// REMOVE MENU
				var value = {
					type: "menu", 
					path: "/skel", 
				};
				var Skel = new ModelsSkel(req.headers.host);
				Skel.uninstall(value, function callback(results) {

				}); 
                                var message = {
                                       action: 'success',
                                       reference: 'waitrefresh',
                                       value: ''
                                };
				utils.rendering(req.headers.host, 'module', {}, req.session.info, req.session.lang, message, function callback(layout){
                                	res.end(layout);
       	                	});

			}
		}
	});
	
}

exports.route = route;
