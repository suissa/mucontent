/* CONFIGURATION FILE
*/

// REQUIREMENTS
var router = require('./lib/route66');
var connect = require('connect');
var mongoStore = require('connect-mongo')(connect);


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
//		secret: "cdacsdaljclks",
		store: new mongoStore({db: 'proxy'})
		})
	);

	app.use(router);

}

module.exports = Config;
