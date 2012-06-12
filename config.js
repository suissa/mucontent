/* MuContent - CONFIGURATION FILE
*/

// REQUIREMENTS
var router = require('./lib/route66');
var connect = require('connect');
var mongoStore = require('connect-mongo')(connect);

var Config = function () {};

// EXPORT CONNECT CONFIGURATION SETTINGS
Config.prototype.Application = function(app) {
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

};

// EXPORT THE PARAMS THAT USE THE APP
Config.prototype.Params = {
	listen_interface: 'lo', // the interface where all client listen (localhost is default)
	ip_protocol: 'IPv4', // the interface protocol	
	heartbeat_ip: '0.0.0.0' // the ip that is shared by all server proxy and identified the master
};

module.exports = Config;
