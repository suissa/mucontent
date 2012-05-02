/* FIRST INSTALL 
	run it only at first time
*/

var newsite = require('./newsite');


function ask(question, format, callback) {
 		var stdin = process.stdin, stdout = process.stdout;
 
 		stdin.resume();
 		stdout.write(question + ": ");
 
		stdin.once('data', function(data) {
   		data = data.toString().trim();
 
	   	if (format.test(data)) {
     			callback(data);
	   	} else {
     			stdout.write("It should match: "+ format +"\n");
     			ask(question, format, callback);
	   	}
 	});
}

ask("Principal Domain (es: myname.com)", /.+/, function(domain) {
  	ask("All Subdomains (add with www too)", /.+/, function(subdomains) {
		var database = domain.split('.')[0];
		var information = {
       			domain: domain,
        		subdomains: subdomains,
			database: database
		};

		newsite.newsite(information, database);
    		console.log("Your domain is: ", domain);
    		console.log("Your database is: ", database);
    		console.log("Your subdomains are:", subdomains);
// stop the script
// TODO use a callback instead of settimeout
	    	setTimeout( function () {
			console.log("Bye");
			process.exit();
		}, 45000);
  	});
});



