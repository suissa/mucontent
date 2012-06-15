/* MuContent - PROXY MODULE CONTROLLER
	Author: Andrea Di Mario
	Version: 0.0.1
	Description: This controller is used to manage the informations in proxy collections
*/

// INCLUDE THE LIBRARY
var router = require('../lib/route66');
var utils = require('../lib/utils');
var cache = require('../lib/cache');
var ModelsProxy = require('../models/proxy');

function route() {

	router.get('/maintenance', utils.restricted_module, utils.restricted, function (req, res) { 
		var message = {}, data = {};
	        var domain = cache.get('domain');
	        domain.forEach( function (row) {
			if (row.database === req.headers.host) {
				if (row.maintenance) {
					data = {
						value: false,
						checked: 'checked' 
					}
				} else {
					 data = {
						value: true
					}
				}
				utils.rendering(req.headers.host, 'maintenance', data, req.session.info, req.session.lang, message, function callback(layout){
                	      		res.end(layout);
	        		});


			}
		});

	});
	router.post('/maintenance', utils.restricted_module, utils.restricted, function (req, res) { 
		var maintenance_update = new ModelsProxy();
		var find = {
			database: req.headers.host
		};
		var value = { 
			maintenance: req.body.maintenance
		};
		maintenance_update.update(find, value, function callbacks(results) {
			var data = {
				form: false
			}            		
          		
			var message = {
				action: 'success',
				reference: 'waitrefresh',
				value: ''
			};
			utils.rendering(req.headers.host, 'maintenance', data, req.session.info, req.session.lang, message, function callback(layout){
                              	res.end(layout);
	               	});
		});
	});

	router.get('/domains', utils.restricted_module, utils.restricted, function (req, res) { 
		var message = {}, data = {};
	        var domain = cache.get('domain');
	        domain.forEach( function (row) {
			if (row.database === req.headers.host) {
				data = {
					form: {form_domains: true},
					content: row.subdomains
				}
				utils.rendering(req.headers.host, 'domains', data, req.session.info, req.session.lang, message, function callback(layout){
                	      		res.end(layout);
	        		});


			}
		});

	});
	router.post('/domains', utils.restricted_module, utils.restricted, function (req, res) { 
		var domains_update = new ModelsProxy();
		var find = {
			database: req.headers.host
		};
		var value = { 
			subdomains: req.body.content
		};
		domains_update.update(find, value, function callbacks(results) {
			var data = {
				form: false
			}            		
			var message = {
				action: 'success',
				reference: 'waitrefresh',
				value: ''
			};
			utils.rendering(req.headers.host, 'domains', data, req.session.info, req.session.lang, message, function callback(layout){
                              	res.end(layout);
	               	});
		});
	});

}

exports.route = route;
