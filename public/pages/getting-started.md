# Getting started

To set up a new website using Simple Markdown CMS, you will need root or sudo access to the server. The assumed environment is a Debian-based linux distribution. We will be installing [nginx][nginx] and [PHP 7.0][php] via the package manager. You *can* use Apache, but you'll need to set up URL rewriting via `.htaccess` files yourself.

## Step by step web server installation

Install git, nginx and PHP and check whether nginx is running correctly.

    # apt-get update
    # apt-get install git nginx php7.0-fpm
    # service nginx start

Browse to the web server, `http://<your ip address here>/`, using your browser. You should see a welcome page that states: *Welcome to nginx!*.

Remove the default website after confirming that everything works.

    # rm /etc/nginx/sites-enabled/default

### Example nginx configuration

Create a new config file in `/etc/nginx/sites-available/`. You can name it whatever you want. I like to use the top level domain (TLD) of the website that is going to hoste it. E.g. `/etc/nginx/sites-available/example.com`. The extension doesn't matter.
    
You can base your configuration on the following example configuration (which assumes PHP7.0 FPM is installed):

    server {
        listen 80;
        listen [::]:80;
        
        server_name example.com;
        
        root /var/www/example.com/public;
        index index.html;
        
        # Serve normal files just as you'd expect, 404 when not found.
        location / {
            try_files $uri $uri/ =404;
        }
        
        # Serve markdown files and menu.csv with a Content-Type charset
        location /pages/ {
            try_files $uri $uri/ =404;
            charset_types text/markdown text/csv;
            charset utf-8;
        }
        
        # Use index.html instead of 404 for missing html documents.
        location ~ ^\/[^/]+\.html$ {
            try_files $uri $uri/ /index.html;
        }
        
        # PHP scripts
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/run/php/php7.0-fpm.sock;
        }
    }
    
For this to work correctly, edit `/etc/nginx/mime.types` and add these two lines between the braces.

        text/markdown                         md;
        text/csv                              csv;
        
While `text/markdown` is not a standardized MIME-type, it is a [valid MIME-type][bcp178] for Markdown documents.

Navigate to `/etc/nginx/sites-enabled/` and create a symbolic link to the `sites-available` config file we just created

    # cd /etc/nginx/sites-enabled/
    # ln -s /etc/nginx/sites-available/example.com
    
Of course substitute your own configuration name instead of `example.com`.

### Website install

Note the root location in the nginx configuration. In the example, it's `/var/www/example.com/public`.

Navigate to `/var/www` and create the `example.com` directory, and make `www-data` the owner of this directory:

    # cd /var/html
    # mkdir example.com
    # chown www-data: example.com
    
If you are not a root user (recommended), you'll need to add the `www-data` group to your user in order to create any files in the `example.com` directory:

    # usermod -aG www-data yourusername
    
Now clone [Simple Markdown CMS][github] to your website directory (or fork it first, and then clone your own repository). Note that we are cloning directly into `example.com` and not creating a sub-directory `SimpleMarkdownCMS` (which is the default behaviour if you don't specify the `.` at the end).

    $ cd example.com
    $ git clone https://github.com/JochemKuijpers/SimpleMarkdownCMS.git .
    
Restart nginx.
 
    # nginx -s reload
    
Navigate to your website and verify it now shows this Simple Markdown CMS page.

### Success

Congratulations! You can now start modifying the files that make up this CMS. Here's a run-down of the most interesting files:

    public/
      + assets/
      |  + css/
      |  |  + custom.css        here you can style your own website
      |  + js/
      |     + main.js           configurable script
      + pages/
      |  + index.md             home page source text
      |  + menu.csv             navigation menu contents
      |  + not_found.md         "Page not found" source text
      |  + *.md                 < create your own pages >
      + index.html              the HTML template to house your content

If anything seems arbitrary or does not quite fit your needs, check the `main.js` file, there's a good chance it is actually configurable.

#### custom.css

A notable style to include is a class `.highlight`, which is added to headings whenever they are directly linked by the URL hash. This can of course be configured in `main.js`.
 
    h1.highlight, h2.highlight, h3.highlight, h4.highlight, h5.highlight, h6.highlight {
        /* ... */
    }

Another style to include is `a.anchor`. This is the link element added to headings to link to them. You may hide these by `display: none;`.


#### index.md
 
This is the fallback for when no page in particular is requested (generally when people visit your website, they'll land on this page). 
#### menu.csv

This is a comma-separated file. Every row represents a navigation bar link. The first column is the text (or HTML) that represents the link, the second is the `href` value for the link. These can be relative links to other markdown pages (with `.html` extension instead of `.md`), or absoolute links to other websites. 

Currently, the script simply splits on the first comma it finds, meaning neither the link text nor the URL may contain commas.
 
#### not_found.md
 
This file is loaded when the actual requested markdown cannot be loaded. It can be configured in `main.js` (at the very top). If it is missing, a default error message will show.
 
#### index.html

Any HTML file is valid here, as long as it loads the `/assets/js/showdown.min.js` and `/assets/js/main.js` scripts (in that order). Loading the stylesheet is recommended but not necessary.

Use an element with `id="content"` to house the page content. An element with `id="menu"` for the menu and an element with `id="loading"` that will display whenever a new page is loading. You can place these elements wherever you want. Just make sure they are in the document.

You may want to include a `<noscript></noscript>` section as well, for visitors with JavaScript disabled.

[github]:       https://github.com/JochemKuijpers/SimpleMarkdownCMS
[nginx]:        https://www.nginx.com
[php]:          https://php.net
[bcp178]:       https://www.rfc-editor.org/bcp/bcp178.txt
