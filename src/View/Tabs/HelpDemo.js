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

        this.helpCategoryList = new this.Input.SelectionList('#helpcategories', function(cat) {
            view.setState({'helpcat': cat});
        });
        this.helpArticleList = new this.Input.SelectionList('#helparticles', function(article) {
            view.setState({'help': article});
        });

        this.demoScriptList = new this.Input.SelectionList('#demoscripts');

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

        this.synchronizeDemoScripts(['anEveningInTheBar.txt',
            'ballAndStick.txt',
            'ballAndStickCtrl.txt',
            'barChart.txt',
            'biljart.txt',
            'canon ball shooting.txt',
            'chimneySweepers1.txt',
            'chimneySweepers2.txt',
            'clickDemo.txt'
        ]);
    }

    /**
     * Loads the help articles and demo scripts, if not already done.
     */
    HelpDemo.prototype.setup = function() {
        if (Object.keys(this.articlesByCategory).length !== 0) {
            return;
        }

        // Get help articles and partition them into categories
        this.articles = controller.getHelpDatabase();
        this.articlesByCategory = this.buildHelpDatabase(this.articles);
        this.articleNames = Object.keys(this.articles);

        // Construct category and article lists
        this.synchronizeCategories(Object.keys(this.articlesByCategory));
        this.synchronizeArticles(this.articleNames);

        // Display first help article
        this.showHelpArticle(this.articleNames[0]);
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

    HelpDemo.prototype.synchronizeCategories = function(categories) {
        this.helpCategoryList.set(categories);
    }

    HelpDemo.prototype.synchronizeArticles = function(articles) {
        this.helpArticleList.set(articles);
    }

    HelpDemo.prototype.showHelpArticle = function(artName) {
        var article = view.tabs.helpdemo.articles[artName];
        var search = view.encodeHTML($('#helpphrase').val().trim());

        // Construct article heading
        this.helpTextBuffer.empty();
        this.helpTextBuffer.append('<h1>' + article.fName + '</h1>');

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
        if (phrase.length <= 2) {
            return;
        }

        // Encode HTML to avoid matching html inside article text
        phrase = view.encodeHTML(phrase);

        var matches = [];
        var re = new RegExp(phrase, "gi");

        // Search in currently displayed article
        $('div.help_text').not("#seealso").each(function() {
            var oldText = $(this).html();

            // Remove old matches first!
            oldText = oldText.replace(/<span class="help_match">([^<]*)<\/span>/gi, '$1');
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
        view.tabs.helpdemo.synchronizeArticles(Object.keys(view.tabs.helpdemo.articlesByCategory[category]));
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
