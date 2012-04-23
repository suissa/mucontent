/* CONFIGURATION FILE
*/

// REQUIREMENTS
// FOR SESSION IN MONGODB
var Db = require('mongodb').Db
 Server = require('mongodb').Server
 server_config = new Server('localhost', 27017, {auto_reconnect: true, native_parser: true})
 db = new Db('proxy', server_config, {})
 mongoStore = require('connect-mongodb');


// EXPORT EXPRESS CONFIGURATION SETTINGS
Config = function(app, express)	{
	app.configure(function () {
		app.set('view engine', 'mustache');
// fix for express 3
		app.layout('.mustache', stache);
		app.set('view options', {
			  layout: false
		});
		app.use(express.methodOverride());
//		app.use(express.logger()); manda su stdout: http://stackoverflow.com/questions/5489815/logging-in-express-js-to-a-output-file
		app.use(express.bodyParser());
		app.use(express.cookieParser("18f6a9847c7dc216e9aa0d5bf8ab639a"));
		app.use(express.session({
    			cookie: {maxAge: 60000 * 20}, // 20 minutes
// 			secret: 'foo',
			store: new mongoStore({db: db})
			})
		);
		app.use(app.router);
		// IMP: SET BEFORE ERRORS, OTHERWISE WORKS ONLY ERRORS
	/*	app.use(express.static(__dirname + '/public'));
		app.use(function (req, res, next) {
				res.send("404");
		});
	*/

	});

	app.configure('development', function () {
		app.use(express.static(__dirname + '/public'));
		app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
	});

	app.configure('production', function () {
		var oneYear = 31557600000;
		// IMP: SET BEFORE ERRORS, OTHERWISE WORKS ONLY ERRORS
		app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
		app.use(function (req, res, next) {
				res.render("404");
		});
		app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
	});

}

module.exports = Config;
