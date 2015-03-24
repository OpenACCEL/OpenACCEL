/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
    fileModule = "fs";
} else {
    fileModule = "jquery";

    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define(["View/Input", "View/HTMLBuffer"], /**@lends View*/ function(Input, HTMLBuffer) {
    /**
     * @class
     * @classdesc The HelpDemo tab.
     */
    function HelpDemo() {
        /**
         * Buffer to contain #helptext content
         * @memberof View
         * @type {HTMLbuffer}
         */
        this.helpTextBuffer = new HTMLBuffer('#helptext');

        /**
         * Search input field.
         *
         * @type {Input}
         */
        this.Input = new Input(this.helpTextBuffer);

        /**
         * The lists for the help categories, help articles and demo scripts, respectively
         */
        this.helpCategoryList = new this.Input.SelectionList('#helpcategories', function(cat) {
            $('#helpcategories > a').removeClass('help_current');
            $('#helpcategories > a[value="' + cat + '"]').addClass('help_current');
            view.addState({'helpcat': cat});
        });
        this.helpArticleList = new this.Input.SelectionList('#helparticles', function(article) {
            $('#helparticles > a').removeClass('help_current');
            $('#helparticles > a[value="' + article + '"]').addClass('help_current');
            view.addState({'help': article});
        });
        this.demoScriptList = new this.Input.SelectionList('#demoscripts', function(script) {
            $('#demoscripts > a').removeClass('help_current');
            $('#demoscripts > a[value="' + script + '"]').addClass('help_current');
            view.setState({'tab': 'editrun', 'script': script});
        });

        /**
         * The database of help articles, in their categories
         *
         * @type {Object}
         */
        this.articles = {};

        /**
         * A partitioning of all articles into the different help categories.
         *
         * @type {Object}
         */
        this.articlesByCategory = {};

        /**
         * List containing the names of all articles
         *
         * @type {Array}
         */
        this.articleNames = [];

        /**
         * All available demo scripts that can be loaded into OpenACCEL
         *
         * @type {Array}
         */
        this.demoScripts = [];

        /**
         * A list of the names of all ACCEL functions.
         *
         * @type {Array}
         */
        this.ACCELFunctionNames = [];

        /**
         * Whether this tab will be entered for the first time the
         * next time it's entered.
         *
         * @type {Boolean}
         */
        this.firstEnter = true;
    }

    /**
     * Event that gets called when this tab gets opened.
     *
     * Loads the help articles and demo scripts, if not already done.
     */
    HelpDemo.prototype.onEnterTab = function(newState) {
        view.hasPlot = false;

        // If this is the first time the tab is activated, setup everything
        if (this.firstEnter) {
            // Get help articles and partition them into categories
            this.articles = controller.getHelpArticles();
            this.articlesByCategory = this.buildHelpDatabase(this.articles);
            this.articleNames = Object.keys(this.articles).sort();

            // Construct category and article lists
            var categories = Object.keys(this.articlesByCategory);
            categories.sort().unshift("All articles");

            this.synchronizeCategories(categories);

            // Setup demo scripts list
            this.demoScripts = controller.getDemoScripts().sort();
            this.synchronizeDemoScripts(this.demoScripts);

            // Setup ACCEL functions list
            this.ACCELFunctionNames = controller.getACCELFunctions();
            this.firstEnter = false;
        }

        // Load initial help category and/or article if given
        if (newState.help) {
            // Only attempt to acces cat attribute if this article
            // actually exists!
            if (this.articles.hasOwnProperty(newState.help)) {
                this.selectHelpCategory(this.articles[newState.help].cat);
            }
            this.showHelpArticle(newState.help);
        } else {
            if (newState.helpcat) {
                this.selectHelpCategory(newState.helpcat);
                $('#helparticles > a').first().trigger('click');
            } else {
                this.synchronizeArticles(this.articleNames);

                // Display first help article in entire list
                this.showHelpArticle(this.articleNames[0]);
            }
        }
    };

    /**
     * Event that gets called when this tab gets closed.
     */
    HelpDemo.prototype.onLeaveTab = function() {

    };

    /**
     * Event that gets called when the hash changes but
     * stays within this tab
     */
    HelpDemo.prototype.onHashChange = function(oldState, newState) {
        // Update current help category if nessecary
        if (newState.helpcat && (newState.helpcat !== oldState.helpcat)) {
            view.tabs.helpdemo.selectHelpCategory(newState.helpcat);
        }

        // Update shown help article if nessecary
        if (newState.help) {
            view.tabs.helpdemo.showHelpArticle(newState.help);
        }
    };

    /**
     * Builds the help database from the given list of articles.
     * The database partitions articles by category.
     *
     * @param  {Object} articles The articles to put into the database
     * @return {Object} A database containing all given articles, partitioned
     * in categories.
     */
    HelpDemo.prototype.buildHelpDatabase = function(articles) {
        var db = {};

        for (var elem in articles) {
            // Get article and category of article
            var article = articles[elem];
            var cat = article.cat;

            // Create category object if it does not yet exist
            if (Object.keys(db).indexOf(cat) === -1) {
                db[cat] = {};
            }

            // Add article object to category
            db[article.cat][article.fName] = article;
        }

        return db;
    };

    /**
     * Asks the user for a script name and submits the script to the server.
     */
    HelpDemo.prototype.submitScript = function() {
        var name = prompt("Please enter a name to identify your script. If the name you propose is not unique, we will add a number to it", "myScriptName");
        if (name == null) {
            return;
        }

        var script = controller.getScriptSource();
        if (script.length <= 3) {
            alert("Error: There is no script to submit.")
        }

        $.ajax({
            type: "POST",
            url: "http://www.openaccel.nl/php/keyMapDBI.php?task=setPost",
            data : {
                'propName': name,
                'pst' : script
            },
            context: this,
            success: function(result, status) {
                alert("Script succesfully uploaded. Visit this link to view your script:\n\nhttp://www.openaccel.nl/#userscript=" + result);
            },
            error: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            fail: function(err) {
                console.log(err);
                controller.ajaxError(this.errorMessage + err.responseText);
                this.errorMessage = "";
                return false;
            },
            async: true
        });
    };

    /**
     * Displays the given categories in the category list.
     *
     * @param {Array} categories List of category names
     */
    HelpDemo.prototype.synchronizeCategories = function(categories) {
        this.helpCategoryList.set(categories);
    };

    /**
     * Displays the given articles in the articles list.
     *
     * @param {Array} articles List of article names
     */
    HelpDemo.prototype.synchronizeArticles = function(articles) {
        this.helpArticleList.set(articles, function(name) {
            if (view.tabs.helpdemo.ACCELFunctionNames.indexOf(name) == -1) {
                return "class='helparticle_nonfunction'";
            } else {
                return '';
            }
        });
    };

    /**
     * Shows the contents of the help article with the given name,
     * if it exists.
     * If it does not exist, an error message is displayed instead.
     *
     * @param  {String} artName The name of the article to display
     */
    HelpDemo.prototype.showHelpArticle = function(artName) {
        var article = view.tabs.helpdemo.articles[artName];
        this.helpTextBuffer.empty();

        // If article not found, display error message
        if (!article) {
            this.helpTextBuffer.append('<h1 style="padding-left: 0px;">Help article not found</h1>');
            this.helpTextBuffer.append('<div class="help_text">It may have been removed, or the name may be incorrect.</div>');
            this.helpTextBuffer.flip();
            return;
        }

        $('#helparticles > a').removeClass('help_current');
        $('#helparticles > a[value="' + artName + '"]').addClass('help_current');

        // Construct normal article heading
        var title = article.fName[0].toUpperCase() + article.fName.slice(1);
        this.helpTextBuffer.append('<h1 style="padding-left: 0px;">' + title + '</h1>');

        /**----- Add every member of the article object as a separate paragraph with it's heading -----**/
        var text;

        // Help
        if (article.help && article.help !== '') {
            text = view.tabs.helpdemo.formatForHelp(article.help);
            this.helpTextBuffer.append('<h3 class="help_heading">Help</h3>');
            this.helpTextBuffer.append('<div class="help_text">' +  text + '</div>');
        }

        // Details
        if (article.details && article.details !== '') {
            text = view.tabs.helpdemo.formatForHelp(article.details);
            this.helpTextBuffer.append('<h3 class="help_heading">Details</h3>');
            this.helpTextBuffer.append('<div class="help_text">' +  text + '</div>');
        }

        // Example
        if (article.example && article.example !== '') {
            text = view.tabs.helpdemo.formatForHelp(article.example);
            this.helpTextBuffer.append('<h3 class="help_heading">Example</h3>');
            this.helpTextBuffer.append('<div class="help_text">' +  text + '</div>');
        }

        // Abbreviation
        if (article.abbreviation && article.abbreviation !== '') {
            text = view.tabs.helpdemo.formatForHelp(article.abbreviation);
            this.helpTextBuffer.append('<h3 class="help_heading">Abbreviation</h3>');
            this.helpTextBuffer.append('<div class="help_text">' +  text + '</div>');
        }

        // Automapping
        if (article.autoMapping && article.autoMapping !== '') {
            text = view.tabs.helpdemo.formatForHelp(article.autoMapping);
            this.helpTextBuffer.append('<h3 class="help_heading">Auto-mapping</h3>');
            this.helpTextBuffer.append('<div class="help_text">' +  text + '</div>');
        }

        // See also
        if (article.seeAlso && article.seeAlso !== '') {
            text = '';
            var links = (article.seeAlso.indexOf(',') > -1) ? article.seeAlso.split(",") : [article.seeAlso];
            for (var j in links) {
                var link = links[j].trim();
                var extraText = (view.tabs.helpdemo.articles[link]) ? ',"helpcat":"' + view.tabs.helpdemo.articles[link].cat + '"' : '';

                text += '<a id="articlelink_' + j + '" class="alink" onclick=\'view.addState({"help":"' + link + '"' + extraText + '});\'>' + link + '</a>, ';
            }
            text = text.substring(0, text.length-2);

            this.helpTextBuffer.append('<h3 class="help_heading">See also</h3>');
            this.helpTextBuffer.append('<div id="seealso" class="help_text">' + text + '</div>');
        }

        // External
        if (article.external && article.external !== '') {
            text = view.tabs.helpdemo.formatForHelp(article.external);
            this.helpTextBuffer.append('<h3 class="help_heading">External reference</h3>');
            this.helpTextBuffer.append('<div class="help_text">' +  text + '</div>');
        }

        this.helpTextBuffer.flip();
    };

    /**
     * Formats the given piece of text for display in a help article. This formats all occurences of the ACCEL and Descartes
     * logos and highlights all matches of the current searcg phrase, if any.
     *
     * @param  {String} text The text to format for display in a help article
     * @return {String} The formatted text
     */
    HelpDemo.prototype.formatForHelp = function(text) {
        var search = view.encodeHTML($('#helpphrase').val().trim());

        // Format ACCEL logo's
        text = text.replace(new RegExp('\\+ACCELTM\\+', 'g'), '<span class="accelTM">ACCEL</span>');

        // Format Descartes logo's
        text = text.replace(new RegExp('\\+DESCARTESTM\\+', 'g'), '<span class="descartesTM">Descartes</span>');

        // Highligh search matches
        if (search !== '' && search.length > 2) {
            text = text.replace(new RegExp(search, "gi"), '<span class="help_match">$&</span>');
        }

        return text;
    };

    /**
     * Searches the help database contents for the given phrase,
     * and displays all help topics that return a match in the list.
     *
     * @param  {String} phrase The phrase to search for in the help database
     */
    HelpDemo.prototype.searchHelp = function(phrase) {
        /**
         * Removes any search highlights from the given text
         *
         * @param {String} text The text from which to remove search highlights
         * @return {String} The given text, with search highlights removed
         */
        function clearMatches(text) {
            return text.replace(/<span class="help_match">([^<]*)<\/span>/gi, '$1');
        }

        // Encode HTML to avoid matching html inside article text
        phrase = view.encodeHTML(phrase);

        // Do a global, case-insensitive search
        var re = new RegExp(phrase, "gi");
        var matches = [];

        // If search term not longer than 2 characters, only clear
        // current search highlights and return
        if (phrase.length <= 2) {
            // Clear existing matches
            $('div.help_text').not("#seealso").each(function() {
                var newText = clearMatches($(this).html());
                $(this).html(newText);
            });

            // Display all demo's again
            this.synchronizeDemoScripts(this.demoScripts);

            return;
        }

        // Search in currently displayed article
        $('div.help_text').not("#seealso").each(function() {
            // Remove old matches first, then highlight new ones!
            var oldText = clearMatches($(this).html());
            var newText = oldText.replace(re, '<span class="help_match">$&</span>');
            $(this).html(newText);
        });

        // Search in all (other) articles
        for (var elem in this.articles) {
            var article = this.articles[elem];
            var match = false;
            for (var i in article) {
                if (re.test(article[i])) {
                    match = true;
                    break;
                }
            }

            if (match) {
                matches.push(article.fName);
            }
        }

        this.synchronizeArticles(matches);

        // Search in demo scripts list
        matches = [];
        for (var elem in this.demoScripts) {
            var demo = this.demoScripts[elem];
            if (re.test(demo)) {
                matches.push(demo);
            }
        }

        this.synchronizeDemoScripts(matches);
    };

    HelpDemo.prototype.selectHelpCategory = function(category) {
        var articles;

        if (category === 'All articles') {
            articles = Object.keys(view.tabs.helpdemo.articles).sort();
        } else {
            articles = Object.keys(view.tabs.helpdemo.articlesByCategory[category]).sort();
        }

        $('#helpcategories > a').removeClass('help_current');
        $('#helpcategories > a[value="' + category + '"]').addClass('help_current');

        view.tabs.helpdemo.synchronizeArticles(articles);
    };

    HelpDemo.prototype.selectHelpArticle = function(article) {
        view.tabs.helpdemo.showHelpArticle(view.tabs.helpdemo.articles[article]);
    };

    HelpDemo.prototype.loadDemoScript= function(demoscript) {
        console.log('demoscript: ' + demoscript);
    };

    HelpDemo.prototype.synchronizeDemoScripts = function(demoscripts) {
        this.demoScriptList.set(demoscripts);
    };

    return HelpDemo;
});
