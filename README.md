MuContent is a multisite and multilanguage cms in Javascript (Node.js) written with a central proxy for balancing the request on multiple client. Based on MongoDB (the intentions are to use it for storage too, without other software for that). Themes are based on Foundation framework and mustache.   
Google Group address: http://groups.google.com/group/mucontent

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
- auth_yet: disable routing if user is connected
- restricted: disable routing if user isn't connected
- restricted_module: disable routing if there are restriction enabled for it in the site's information collection

---------------------------------

# LICENSE

(The MIT License)

Copyright (c) 2012 Andrea Di Mario

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
