// BEGIN CONFIGURATION
// BEGIN CONFIGURATION
// BEGIN CONFIGURATION

var CONFIG = {
    BASE_URL: "/",                                  // the base path of this website (absolute to the domain name)
    PAGES: {
        PATH: "pages/",                             // the relative path to the markdown directory
        INDEX_PAGE: "index",                        // the name for the index page
        NOT_FOUND_PAGE: "not_found",                // the name for the "Page not found" page
        MENU: "menu"                                // the name of the CSV file for the navigation menu
    },
    IDS: {
        CONTENT_ID: "content",                      // the name of the page content element
        MENU_ID: "menu",                            // the name of the navigation menu element
        LOADING_ID: "loading"                       // the name of the loading element
    },
    HIGHLIGHT: {
        CLASSNAME: "highlight",                     // the class name to add to highlighted headings
        DURATION_MS: 500                            // how long headings will keep the class when linked
    },
    SHOWDOWN_OPTIONS: {
        omitExtraWLInCodeBlocks: false,             // omit white lines at the end of code blocks
        noHeaderId: false,                          // entirely remove header IDs, settings to true will break anchors
        ghCompatibleHeaderId: true,                 // add dashes between words of header anchor IDs
        prefixHeaderId: "",                         // prefix of header anchor IDs
        headerLevelStart: 1,                        // defines at which level to start headings (1: <h1>, 2: <h2>, etc.)
        parseImgDimensions: false,                  // parse image dimension syntax (see Showdown docs)
        simplifiedAutoLink: true,                   // parse plain text URLs
        excludeTrailingPunctuationFromURLs: true,   // exclude trailing punctuation from (simplifiedAutoLink) URLs
        literalMidWordUnderscores: false,           // don't parse mid-word underscores as emphasis
        strikethrough: true,                        // parse strikethrough syntax (see Showdown docs)
        tables: true,                               // parse markdown table syntax (see Showdown docs)
        tablesHeaderId: false,                      // generate automatic IDs for table headers
        ghCodeBlocks: true,                         // parse backtick-fenced code block syntax (see Showdown docs)
        tasklists: false,                           // parse tasklist syntax (see Showdown docs)
        ghMentions: false,                          // parse mention syntax (see Showdown docs)
        ghMentionsLink: "https://github.com/{u}",   // URL for linking to (ghMentions) mentions
        smoothLivePreview: false,                   // see Showdown docs
        smartIndentationFix: false,                 // see Showdown docs
        disableForced4SpacesIndentedSublists: true, // disable the 4-space requirement for sub-list indentation
        simpleLineBreaks: false,                    // parse line breaks as <br /> in paragraphs
        requireSpaceBeforeHeadingText: false,       // require a space between # and heading text
        encodeEmails: true,                         // obfuscate email links by using ASCII character entries
        emoji: true,                                // parse emoji shortcuts
        extensions: ["fixlinktargets", "header-anchors"]
    }
};

// END CONFIGURATION
// END CONFIGURATION
// END CONFIGURATION

// showdown extensions

showdown.extension('fixlinktargets', function() {
    return [{
        type: "html",
        regex: /(<a href=")([^"]*)(.*?(?=<\/a>)<\/a>)/g,
        replace: function(wholeMatch, preHref, href, postHref) {
            if (!isExternalHref(href)) {
                return preHref + href + "\" data-href=\"" + href + "\" onClick=\"navigate(event);" + postHref;
            }
            return preHref + href + "\" class=\"external\" title=\"" + href + "\" target=\"_blank" + postHref;
        }
    }];
});
showdown.extension("header-anchors", function() {
    return [{
        type: "html",
        regex: /(<h([1-6]) id="([^"]+?)">)(.*<\/h\2>)/g,
        replace: "$1<a aria-hidden=\"true\" class=\"anchor\" href=\"#$3\" data-hash=\"#$3\" onclick=\"anchor(event);\"></a>$4"
    }];
});

// class declarations

function HtmlCache(maxSize) {
    this.maxSize = maxSize;
    this.names = [];
    this.htmls = [];
}

HtmlCache.prototype.put = function(page, html) {
    if (this.names.maxSize > this.maxSize) {
        this.names.shift();
        this.htmls.shift();
    }
    var i = this.names.findIndex(function (e) { return e === page; });
    if (i >= 0) {
        this.names.splice(i, 1);
        this.htmls.splice(i, 1);
    }
    this.names.push(page);
    this.htmls.push(html);
};

HtmlCache.prototype.get = function(page) {
    var i = this.names.findIndex(function (e) { return e === page; });
    if (i >= 0) { return this.htmls[i]; }
    return "";
};

// function declarations

function isExternalHref(href) {
    var matches = href.match(/([a-z][a-z0-9]*):\/\/.*/g);
    return !!matches;
}

function getTextFile(url, onReady) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Accept", "text/*");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var response = "";
            if (xhr.status > 0) {
                response = xhr.responseText;
            }
            setTimeout(function() {onReady(xhr.status, response);}, 100);
        }
    };
    xhr.send();
    return xhr;
}

function parseMarkdown(markdown) {
    var converter = new showdown.Converter(CONFIG.SHOWDOWN_OPTIONS);
    return converter.makeHtml(markdown);
}

function setHtml(targetElement, html) {
    targetElement.innerHTML = html;
    targetElement.dispatchEvent(new Event("change"));
}

function sanitizePageName(name) {
    // finds just the file name of the path, without extensions
    var matches = name.match(/^((?:[^\/]*\/)*)?([^.]+)(\..*)?$/);
    if (!matches) { return ""; }
    return matches[2];
}

var loadingPageXhr = null;
var htmlCache = new HtmlCache(16);
function loadPage(targetElement, pageName, redirect) {
    pageName = sanitizePageName(pageName);
    if (pageName === "") { return false; }
    redirect = redirect !== false;

    if (window.location.pathname !== CONFIG.BASE_URL + pageName + ".html") {
        if (redirect) {
            history.pushState(pageName, "", pageName + ".html");
        }
    }

    // try cache for immediate feedback to the user, while we're getting the latest version..
    var cached = htmlCache.get(pageName);
    if (cached !== "") {
        setHtml(targetElement, cached);
    } else {
        document.getElementById("spinner").style.display = "block";
    }

    if (loadingPageXhr) {
        loadingPageXhr.abort();
    }
    loadingPageXhr = getTextFile(
        CONFIG.BASE_URL + CONFIG.PAGES.PATH + pageName + ".md",
        function(status, response) {
            document.getElementById("spinner").style.display = "none";
            var html = "";
            if (status === 200) {
                html = parseMarkdown(response);
                htmlCache.put(pageName, html);
                setHtml(targetElement, html);
                setTimeout(scrollToHash, 1);
            } else if (status > 0) {
                if (pageName !== CONFIG.PAGES.NOT_FOUND_PAGE) {
                    loadPage(targetElement, CONFIG.PAGES.NOT_FOUND_PAGE, false);
                } else {
                    setHtml(targetElement, parseMarkdown("# Page not found\n" +
                        "*The page you are trying to view, is not available!*\n\n" +
                        "Additionally, the error page could not be loaded.\n" +
                        "If you think this is an error, please contact the website administrator."
                    ));
                }
            }
        }
    );

    return true;
}

function loadMenu(targetElement) {
    getTextFile(CONFIG.BASE_URL + CONFIG.PAGES.PATH + CONFIG.PAGES.MENU + ".csv",
        function (status, response) {
            if (status === 200) {
                var items = response.match(/[^\r\n]+/g);
                var html = "<ul>";
                for (var n = 0; n < items.length; n ++) {
                    var item = items[n];
                    var parts = item.split(",");
                    html += "<li>";
                    if (!isExternalHref(parts[1])) {
                        html += "<a href=\"" + parts[1] + "\" data-href=\"" + parts[1] + "\" onClick=\"navigate(event);\">" + parts[0] + "</a>";
                    } else {
                        html += "<a href=\"" + parts[1] + "\" target=\"_blank\">" + parts[0] + "</a>";
                    }
                    html += "</li>";
                }
                html += "</ul>";
                setHtml(targetElement, html);
            } else {
                setHtml(targetElement, "<em>Error loading navigation bar</em>");
            }
        }
    );
}

function navigate(event) {
    var linkElement = event.target;
    loadPage(document.getElementById(CONFIG.IDS.CONTENT_ID), linkElement.dataset.href, true);
    event.preventDefault();
}

function anchor(event) {
    var linkElement = event.target;
    var pageName = sanitizePageName(window.location.pathname);
    history.pushState(pageName, "", linkElement.dataset.hash);
    scrollToHash();
    event.preventDefault();
}

function scrollToHash() {
    var hash = window.location.hash.substr(1);
    var top = 0;
    if (hash) {
        var hashElement = document.getElementById(hash);
        if (hashElement) {
            window.scrollTo(0, 0);
            top = hashElement.getBoundingClientRect().top;
            highlightElement(hashElement);
        }
    }
    window.scrollTo(0, top);
}

function highlightElement(el) {
    el.classList.add(CONFIG.HIGHLIGHT.CLASSNAME);
    setTimeout(function() {
        el.classList.remove(CONFIG.HIGHLIGHT.CLASSNAME);
    }, CONFIG.HIGHLIGHT.DURATION_MS);
}

// event listeners

document.addEventListener("DOMContentLoaded", function() {
    loadMenu(document.getElementById(CONFIG.IDS.MENU_ID));
    var page = window.location.pathname;
    if (page === "" || page === "/") {
        page = CONFIG.INDEX_PAGE;
    }
    loadPage(document.getElementById(CONFIG.IDS.CONTENT_ID), page, false);
});

window.onpopstate = function(event) {
    loadPage(document.getElementById(CONFIG.IDS.CONTENT_ID), event.state || CONFIG.INDEX_PAGE, false);
};