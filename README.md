MuContent is a multisite, scalable and multilanguage cms written in Javascript (Node.js). Written with a central proxy for balancing the request on multiple client on cluster or cloud based architecture. It uses MongoDB for storage all content and for its scalable features. Themes are based on Foundation framework and mustache.   
Google Group: http://groups.google.com/group/mucontent

# INSTALLATION

Go into lib directory, then run: `node newsite.js "myname.com" "www.myname.com,..."`

Where the first argument is the principal site and the second argument is the list of subdomains separed by a comma.  
This create the first site and each new site that you want.

Insert the data and points the domain and subdomains to 127.0.0.1 on /etc/hosts

Run: `node app.js`

On browser: http://myname.com

Admin User: admin  
Admin Password: admin

# HOW CREATE A MODULE

You must create a controller and a models with module's name, see: controller/skel.js and models/skel.js

# HOW RESTRICT ACCESS TO A ROUTE

You can add in a route some function before the normal response to manage the access from lib/utils.js, in particoular:  
- auth_yet: disable routing if user is connected (admin can enter)
- restricted: disable routing if user isn't connected
- restricted_module: disable routing if there are restriction enabled for it in the site's information collection

# LANGUAGE

You can change menu and pagetitle language added it to the value separeted by a comma in the "Menu" and "Path" page.
For site text and basic controller language you can work in the page "Language" in the admin area to add the language. Then go in "Content" and write you content. Go in "Themes" and in the mustache tag {{content_...}} for your page add the tag that you set in "Content" as {{tag}}.    
You can add your content wherever you want in the Theme.   
The language selection work on the session variable req.session.lang and the language id.   
Type of content in collections: Message (application message in controller route) and Content (all content in theme that can be manage by mustache).

# MAINTENANCE MODE

You can add the check if your application is in maintenance mode into you router.get() function with the definition of function utils.maintenance (lib/utils.js), see /home and /registration path on the controllers.  
Admin could see everything and /login path haven't the maintenance function by default.

# MENU AND SUBMENU

If you want add a parent without path use # as it.

# STATIC PAGE

Add a page into Admin->Page, go into Admin->Menu (or SubMenu) and link the page, then in Admin->Theme, under {{staticcontent}} put:
`{{#content_pagename}}

{{/content_pagename}}`
Here you can put all your static HTML, or you can create a Content (Admin->Content) and put here your tag.   
Note: on Admin->Content you can insert HTML.

# MODULES

- Blog: https://github.com/anddimario/mucontent-blog

# HIGH AVAILABILITY (cloud or cluster solution)

Go on config.js and edit heartbeat_ip and network_configuration_command as the example.

# MONIT: APPLICATION MONITOR

You can use monit to monitor the app and, in cluster configuration, you must use it to deconfigure network interface on the lost master proxy.   
Here a configuration example: 

`#!monit`   
`set logfile /var/log/monit.log`

`# Restart the service`   
`check process nodejs with pidfile "/var/run/mucontent.pid"`   
`    start program = "/sbin/start mucontent"`   
`    stop program  = "/sbin/stop mucontent"`   

`# Deconfigure high availability IP if PID changed`    
`check file mucontent with path "/var/run/mucontent.pid"`   
`    if changed timestamp then exec "/sbin/ifconfig eth0:1 down"`

# CREATE A SERVICE (UPSTART)

Write this /etc/init/mucontent.conf:

`#!upstart`   
`description "MuContent CMS"`    
`author      "Andrea Di Mario"`

`start on startup`   
`stop on shutdown`   

`script`   
`	# Create Pid file for monitoring`   
`	echo $$ > /var/run/mucontent.pid`   
`	chdir /root/content`   
`	exec /usr/local/bin/node app.js >> /var/log/mucontent.log 2>&1`    
`	respawn`   
`end script`

`pre-start script`   
`    echo "[\`date -u +%Y-%m-%dT%T.%3NZ\`] Starting MuContent CMS" >> /var/log/mucontent.log`   
`end script`

`pre-stop script`   
`    rm /var/run/yourprogram.pid`   
`    echo "[\`date -u +%Y-%m-%dT%T.%3NZ\`] Stopping MuContent CMS" >> /var/log/mucontent.log`   
`end script`

`respawn limit 3 60`

Then, you can run: `start mucontent`, `status mucontent`, `restart mucontent` and `stop mucontent`

# THANKS TO (for support and/or help)

- vdemedes (Route66): https://github.com/vdemedes

TESTED ON UBUNTU 12.04 (lxc virtualization) with NODE.JS 0.8

---------------------------------

# LICENSE

(The MIT License)

Copyright (c) 2012 Andrea Di Mario

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
