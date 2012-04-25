/* POST CONTROLLER
*/

var router = require('route66');
var ModelsPost = require('../models/posts.js');
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

	router.get('/posts/:operation?', utils.restricted_module, utils.restricted, function (req, res) { 
		var data = {};
		if (req.params.operation) {
			data.type = req.params.operation,
			data.title = 'ciao';
		} else {
			data.type = 'new';
		}
		utils.rendering(req.headers.host, 'posts', data, req.session.connected, function callback(layout) {
			res.end(layout);
		});
	} );
	router.post('/posts', utils.restricted_module, utils.restricted, function (req, res) { 
		var validator = new Validator();   
		validator.check(req.body.title, 'title').notEmpty();
		validator.check(req.body.content, 'post').notEmpty();
		var errors = validator.getErrors();
                var domain = cache.get('domain'), post_layout = {};
		if (errors.length)
		{
			var data = {message: 'Required fields: ' + errors,
				title: req.body.title,
				content: req.body.content};
			utils.rendering(req.headers.host, 'posts', data, req.session.connected, function callback(layout) {
				res.end(layout);
			});
		} else {
			if (req.body.type == "new"){
				var post_insert = new ModelsPost(req.headers.host);
				var title = req.body.title;
				var slug = title.replace(' ', '-');
				var date = new Date();
				var value = {
					title: req.body.title, 
					content: req.body.content, 
					slug: slug,
					date: date
				};
				post_insert.insert(value, function callbacks(results) {
					var data = {form: false,
						data: results};
					utils.rendering(req.headers.host, 'posts', data, req.session.connected, function callback(layout) {
						res.end(layout);
					});			
				});			
			} else if (req.body.type == "edit") {
				res.end("ciao");
			}
		}
	} );

	router.get('/archive/:page?', function (req, res) {
		var post_list = new ModelsPost(req.headers.host);
		var value = {}, skip;
		if (req.params.page == 1) {
			skip = 0;
		} else {
			skip = 5 * (req.params.page - 1);
		}
// TODO: continue and see how paginator on view
		var options = {skip: skip, limit: 5}
		post_list.find(value, options, function callbacks(results) {
			var data = { form: { post: false },
				data_posts: results};
			utils.rendering(req.headers.host, 'posts', data, req.session.connected, function callback(layout) {
				res.end(layout);
			});
		}); 
	} );

}

exports.route = route;
