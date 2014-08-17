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

        this.helpCategoryList = new this.Input.SelectionList('#helpcategories', this.selectHelpCategory);
        this.helpArticleList = new this.Input.SelectionList('#helparticles', this.selectHelpArticle);
        this.demoScriptList = new this.Input.SelectionList('#demoscripts', this.loadDemoScript);

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
        var hoi = this.articles[this.articleNames[0]];
        this.showHelpArticle(this.articles[this.articleNames[0]]);
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

    HelpDemo.prototype.showHelpArticle = function(article) {
        this.helpTextBuffer.empty();

        this.helpTextBuffer.append('<h1>' + article.fName + '</h1>');

        var members = Object.keys(article);
        for (var i in members) {
            var member = members[i];
            if (member !== 'fName') {
                this.helpTextBuffer.append('<h3 class="help_heading">' + member + '</h3>');
                this.helpTextBuffer.append('<p class="help_text">' + article[member] + '</p>');
            }
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
        var matches = [];

        for (var elem in this.articles) {
            var article = this.articles[elem];
            var match = false;
            for (var i in article) {
                if (article[i].indexOf(phrase) !== -1) {
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
