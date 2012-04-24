/* CONFIGURATION FILE
*/

// REQUIREMENTS
var router = require('route66');
var connect = require('connect');
// FOR SESSION IN MONGODB
var Db = require('mongodb').Db
 Server = require('mongodb').Server
 server_config = new Server('localhost', 27017, {auto_reconnect: true, native_parser: true})
 db = new Db('proxy', server_config, {})
 mongoStore = require('connect-mongodb');


// EXPORT EXPRESS CONFIGURATION SETTINGS
Config = function(app)	{
	var oneDay = 86400000;
	// IMP: SET BEFORE OTHER, OTHERWISE IT DOESN'T WORK
	app.use(connect.static(__dirname + '/public', { maxAge: oneDay }));
	app.use(connect.methodOverride());
//		app.use(connect.logger('dev')); manda su stdout: http://stackoverflow.com/questions/5489815/logging-in-express-js-to-a-output-file
	app.use(connect.bodyParser());
	app.use(connect.cookieParser("cadcsda"));
	app.use(connect.session({
		cookie: {maxAge: 60000 * 20}, // 20 minutes
		store: new mongoStore({db: db})
		})
	);

	app.use(router);
	app.use(function(err, req, res, next){
		res.end("404");
	});
	

}

module.exports = Config;
