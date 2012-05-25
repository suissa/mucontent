/* CONFIGURATION FILE
*/

// REQUIREMENTS
var router = require('./lib/route66');
var connect = require('connect');
var mongoStore = require('connect-mongo')(connect);

// EXPORT EXPRESS CONFIGURATION SETTINGS
Config = function(app)	{
	var oneDay = 86400000;
	// IMP: SET ABOVE OTHER, OTHERWISE IT DOESN'T WORK
	app.use(connect.static(__dirname + '/public', { maxAge: oneDay }));
	app.use(connect.methodOverride());
	app.use(connect.bodyParser());
	app.use(connect.cookieParser("cadcsdafdafdsfdsafsa"));
	app.use(connect.session({
		cookie: {maxAge: 60000 * 20}, // 20 minutes
		store: new mongoStore({db: 'proxy'})
		})
	);

	app.use(router);

}

module.exports = Config;
