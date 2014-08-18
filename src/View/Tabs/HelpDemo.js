require.config({
    baseUrl: "scripts"
});

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
            view.setState({'helpcat': cat});
        });
        this.helpArticleList = new this.Input.SelectionList('#helparticles', function(article) {
            view.setState({'help': article});
        });
        this.demoScriptList = new this.Input.SelectionList('#demoscripts', function(script) {
            view.setState({'script': script});
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
    }

    /**
     * Loads the help articles and demo scripts, if not already done.
     */
    HelpDemo.prototype.setup = function() {
        if (Object.keys(this.articlesByCategory).length !== 0) {
            return;
        }

        // Get help articles and partition them into categories
        this.articles = controller.getHelpArticles();
        this.articlesByCategory = this.buildHelpDatabase(this.articles);
        this.articleNames = Object.keys(this.articles);

        // Construct category and article lists
        var categories = Object.keys(this.articlesByCategory);
        categories.unshift("All articles");

        this.synchronizeCategories(categories);
        this.synchronizeArticles(this.articleNames);

        // Display first help article
        this.showHelpArticle(this.articleNames[0]);

        // Setup demo scripts list
        this.demoScripts = controller.getDemoScripts();
        this.synchronizeDemoScripts(this.demoScripts);
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
     * Displays the given categories in the category list.
     *
     * @param {Array} categories List of category names
     */
    HelpDemo.prototype.synchronizeCategories = function(categories) {
        this.helpCategoryList.set(categories);
    }

    /**
     * Displays the given articles in the articles list.
     *
     * @param {Array} articles List of article names
     */
    HelpDemo.prototype.synchronizeArticles = function(articles) {
        this.helpArticleList.set(articles);
    }

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
            this.helpTextBuffer.append('<h1>Article not found!</h1>');
            this.helpTextBuffer.append('<div class="help_text">It may have been removed, or the name may be incorrect.</div>');
            this.helpTextBuffer.flip();
            return;
        }

        // Construct article heading
        this.helpTextBuffer.append('<h1>' + article.fName + '</h1>');

        var search = view.encodeHTML($('#helpphrase').val().trim());

        // Returns the given text with all matches of the search string highlighted, if any
        function matchSearch(text) {
            if (search === '' || search.length <= 2) {
                return text;
            } else {
                return text.replace(new RegExp(search, "gi"), '<span class="help_match">$&</span>');
            }
        }

        /**----- Add every member of the article object as a separate paragraph with it's heading -----**/
        // Help
        if (article.help !== '') {
            this.helpTextBuffer.append('<h3 class="help_heading">Help</h3>');
            this.helpTextBuffer.append('<div class="help_text">' + matchSearch(article.help) + '</div>');
        }

        // Details
        if (article.details !== '') {
            this.helpTextBuffer.append('<h3 class="help_heading">Details</h3>');
            this.helpTextBuffer.append('<div class="help_text">' + matchSearch(article.details) + '</div>');
        }

        // Example
        if (article.example !== '') {
            this.helpTextBuffer.append('<h3 class="help_heading">Example</h3>');
            this.helpTextBuffer.append('<div class="help_text">' + matchSearch(article.example) + '</div>');
        }

        // Automapping
        if (article.autoMapping !== '') {
            this.helpTextBuffer.append('<h3 class="help_heading">Auto-mapping</h3>');
            this.helpTextBuffer.append('<div class="help_text">' + matchSearch(article.autoMapping) + '</div>');
        }

        // See also
        var text = '';
        var links = (article.seeAlso.indexOf(',') > -1) ? article.seeAlso.split(",") : [article.seeAlso];
        for (var j in links) {
            var link = links[j].trim();
            var extraText = (view.tabs.helpdemo.articles[link]) ? ',"helpcat":"' + view.tabs.helpdemo.articles[link].cat + '"' : '';

            text += '<a id="articlelink_' + j + '" class="alink" onclick=\'view.setState({"help":"' + link + '"' + extraText + '});\'>' + link + '</a>, ';
        }
        text = text.substring(0, text.length-2);

        this.helpTextBuffer.append('<h3 class="help_heading">See also</h3>');
        this.helpTextBuffer.append('<div id="seealso" class="help_text">' + text + '</div>');

        // External
        if (article.external !== '') {
            this.helpTextBuffer.append('<h3 class="help_heading">External reference</h3>');
            this.helpTextBuffer.append('<div class="help_text">' + matchSearch(article.external) + '</div>');
        }

        this.helpTextBuffer.flip();
    }

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
    }

    HelpDemo.prototype.selectHelpCategory = function(category) {
        var articles;

        if (category === 'All articles') {
            articles = Object.keys(view.tabs.helpdemo.articles);
        } else {
            articles = Object.keys(view.tabs.helpdemo.articlesByCategory[category]);
        }

        view.tabs.helpdemo.synchronizeArticles(articles);
    }

    HelpDemo.prototype.selectHelpArticle = function(article) {
        view.tabs.helpdemo.showHelpArticle(view.tabs.helpdemo.articles[article]);
    }

    HelpDemo.prototype.loadDemoScript= function(demoscript) {
        console.log('demoscript: ' + demoscript);
    }

    HelpDemo.prototype.synchronizeDemoScripts = function(demoscripts) {
        this.demoScriptList.set(demoscripts);
    }

    return HelpDemo;
});
