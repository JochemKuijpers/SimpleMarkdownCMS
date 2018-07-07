# Simple Markdown CMS

You're looking at [Simple Markdown CMS][github], a very simplistic Content Management System that is easily customizable and does not require a database server. It tries to be a good starting point for a semi-static website such as a personal portfolio. It was originally created for [my personal website][personal].

At the very minimum, a web server like nginx or Apache is required to serve static pages. If you want editing capabilities, you'll need PHP as well. That's right, *this CMS functions without a database!*

**Note: The editing feature is not yet finished.**

## Features

- *One-page* application*
- Fully configurable markdown parser (uses [Showdown][showdown])
- Automatically link to headings
- Configurable navigation menu
- Client-side Markdown parsing with caching
- No database required!

*) Don't worry, Google will still be able to crawl your website! These days, search engine web crawlers run JavaScript just like normal browsers.

## Getting started

See [Getting Started][gettingstarted].

[github]:           https://github.com/JochemKuijpers/SimpleMarkdownCMS
[personal]:         https://jochemkuijpers.nl
[showdown]:         http://showdownjs.com
[gettingstarted]:   public/pages/getting-started.md
