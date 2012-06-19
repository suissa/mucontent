/* MuContent - CONFIGURATION FILE
*/

// REQUIREMENTS
var router = require('route66');
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
	// DEFAULT PATH TO IGNORE (leave first element empty)
	default_path: ['module', 'themes', 'maintenance', 'domains', 'content', 'language', 'menu', 'page', 'submenu'],
	default_controller: ['base', 'user', 'proxy'],

	// NETWORK INTERFACES
	listen_interface: 'lo', // the interface where all client listen (localhost is default)
	ip_protocol: 'IPv4', // the interface protocol	
	heartbeat_ip: '0.0.0.0', // the ip that is shared by all server proxy and identified the master

	// DATABASE
	// For replicasets see: https://github.com/mongodb/node-mongodb-native/blob/master/docs/replicaset.md	
	mongodb_ip: '127.0.0.1', // the mongodb ip
	mongodb_port: 27017, // the mongodb port

	client_port: '8080', // the client port

	// MESSAGES
	invalid_request: '<center> Your request is not valid, contact: admin@domain.com</center>',
	maintenance_message: '<center>We will back soon</center>'
};

module.exports = Config;
