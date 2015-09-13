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
     * @classdesc The Help tab.
     */
    function Help() {
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
         * The lists for the help subcategories, articles and related articles, respectively
         */
        this.helpSubCategoryList = new this.Input.SelectionList('#helpsubcategories', function(catname, catid) {
            var maincat = view.tabs.help.getMainCategoryForSub(catid);
            $('#helpsubcategories > a').removeClass('help_current');
            $('#helpsubcategories > a').filter(function(i) {
                return $(this).attr("value") == catname;
            }).addClass('help_current');
            view.tabs.help.searching = false;
            view.setState({'tab': 'help', 'helpsubcat': catid});
        });
        this.helpArticleList = new this.Input.SelectionList('#helparticles', function(name, id) {
            $('#helparticles > a').removeClass('help_current');
            $('#helparticles > a').filter(function(i) {
                return $(this).attr("value") == name;
            }).addClass('help_current');
            view.addState({'help': id});
        });
        this.relatedArticlesList = new this.Input.SelectionList('#relatedarticles', function(name, id) {
            $('#relatedarticles > a').removeClass('help_current');
            $('#relatedarticles > a').filter(function(i) {
                return $(this).attr("value") == name;
            }).addClass('help_current');
            view.tabs.help.searching = false;
            view.addState({'help': id});
        });

        /**
         * The available help categories with their subcategories
         *
         * @type {Array}
         */
        this.helpcategories = {};

        /**
         * List containing the names of all articles
         *
         * @type {Array}
         */
        this.articleNames = [];

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

        /**
         * Whether a search is in progress
         *
         * @type {Boolean}
         */
        this.searching = false;
    }

    /**
     * Event that gets called when this tab gets opened.
     *
     * Loads the help articles and demo scripts, if not already done.
     */
    Help.prototype.onEnterTab = function(newState) {
        view.hasPlot = false;

        // If this is the first time the tab is activated, setup everything
        if (this.firstEnter) {
            // Retrieve help categories and sub-categories from server and cache them
            this.helpcategories = controller.getHelpCategories();
            this.synchronizeCategories(this.helpcategories);

            // Setup ACCEL functions list
            this.ACCELFunctionNames = controller.getACCELFunctions();
            this.firstEnter = false;
        }

        // Load initial help category and/or article if given
        if (newState.help) {
            this.showHelpArticle(newState.help, true);
        } else {
            if (newState.helpsubcat) {
                // Load articles in category and display first article to start with
                this.selectHelpSubCategory(newState.helpsubcat, true);
                $('#helparticles > a').first().trigger('click');
            } else if (newState.helpcat) {
                this.selectHelpCategory(newState.helpcat);
            } else {
                // Determine first help category by ID
                var i=0;
                while (this.helpcategories[i] === undefined) {
                    i++;
                }
                this.selectHelpCategory(i);
                this.selectHelpSubCategory(this.helpcategories[i]['subcategories'][0]['id']);

                // Load first help article in first category
                this.showHelpArticle(5);
            }
        }
    };

    /**
     * Event that gets called when this tab gets closed.
     */
    Help.prototype.onLeaveTab = function() {

    };

    /**
     * Event that gets called when the hash changes but
     * stays within this tab
     */
    Help.prototype.onHashChange = function(oldState, newState) {
        // Update current help category if nessecary
        if (newState.helpcat && (newState.helpcat !== oldState.helpcat)) {
            view.tabs.help.selectHelpCategory(newState.helpcat);
        }

        // Update current help subcategory if nessecary
        if (newState.helpsubcat && (newState.helpsubcat !== oldState.helpsubcat)) {
            view.tabs.help.selectHelpSubCategory(newState.helpsubcat);
        }

        // Update shown help article if nessecary
        if (newState.help) {
            // Only update subcategories and article lists if the user is not searching!
            // Otherwise the list of search results would be lost
            view.tabs.help.showHelpArticle(newState.help, this.searching !== true);
        }
    };

    /**
     * Displays the given categories in the category list.
     *
     * @param {Array} categories List of category names
     */
    Help.prototype.synchronizeCategories = function(categories) {
        var html = '';
        for (var catid in categories) {
            var cat = categories[catid];
            html += '<input type="button" data-id="' + catid + '" class="buttonin" value="' + cat['name'] + '" onclick="view.tabs.help.searching = false; view.setState({\'tab\': \'help\', \'helpcat\': ' + catid + '});" />';
        }

        $("#helpcategories").html(html);
    };


    /**
     * Displays the given subcategories in the subcategory list.
     *
     * @param {Array} categories List of subcategory names
     */
    Help.prototype.synchronizeSubCategories = function(categories) {
        this.helpSubCategoryList.setWithIDs(categories);
    };

    /**
     * Displays the given articles in the articles list.
     *
     * @param {Array} articles List of article names
     */
    Help.prototype.synchronizeArticles = function(articles) {
        this.helpArticleList.setWithIDs(articles);
    };

    /**
     * Returns the main help category under which the given subcategory
     * is filed
     * @param  {Number} subcat The ID of the subcategory
     * @return {Number}        The ID of the main category
     */
    Help.prototype.getMainCategoryForSub = function(subcat) {
        var maincat = null;
        for (var elem in this.helpcategories) {
            var isMainCategoryForSubcat = false;
            for (var el in this.helpcategories[elem]['subcategories']) {
                if (this.helpcategories[elem]['subcategories'][el]['id'] == subcat) {
                    isMainCategoryForSubcat = true;
                    break;
                }
            }
            if (isMainCategoryForSubcat === true) {
                maincat = elem;
                break;
            }
        }

        return maincat;
    };

    /**
     * Shows the contents of the help article with the given id,
     * if it exists.
     * If it does not exist, an error message is displayed instead.
     *
     * @param {Number} id The id of the article to display
     * @param {Boolean} setCategory Whether to also set the correct category in the interface,
     * belonging to the given article
     */
    Help.prototype.showHelpArticle = function(id, setCategory) {
        var article = controller.getHelpArticle(id);
        this.helpTextBuffer.empty();

        // If article not found, display error message
        if (!article) {
            this.helpTextBuffer.append('<h2 style="padding-left: 0px;">Help article not found</h2>');
            this.helpTextBuffer.append('<div class="help_text">It may have been removed, or the name may be incorrect.</div>');
            this.helpTextBuffer.flip();
            return;
        }

        // Set right category and subcategory in interface when specified
        if (setCategory === true) {
            // Determine main category based on subcategory of article, and set both in interface
            var subcat = article.category;
            var cat = this.getMainCategoryForSub(subcat);

            this.selectHelpCategory(cat);
            this.selectHelpSubCategory(subcat);
        }

        $('#helparticles > a').removeClass('help_current');
        $('#helparticles > a[data-id="' + id + '"]').addClass('help_current');

        // Display found article
        this.helpTextBuffer.append(this.formatForHelp(article.body));
        this.helpTextBuffer.flip();

        // Update related list
        this.relatedArticlesList.setWithIDs(article.related);
    };

    /**
     * Formats the given piece of text for display in a help article. This formats all occurences of the ACCEL and Descartes
     * logos and highlights all matches of the current searcg phrase, if any.
     *
     * @param  {String} text The text to format for display in a help article
     * @return {String} The formatted text
     */
    Help.prototype.formatForHelp = function(text) {
        /**
         * Escapes the given string for use in building a dynamic regex pattern
         *
         * @param  {String} str The string to escape
         * @return {String}     The escaped string, safe for use inside a regex pattern
         */
        function escapeRegex(str) {
            return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }

        var search = view.encodeHTML($('#helpphrase').val().trim());

        // Format ACCEL logo's
        text = text.replace(new RegExp('\\+ACCELTM\\+', 'g'), '<span class="accelTM">ACCEL</span>');

        // Format Descartes logo's
        text = text.replace(new RegExp('\\+DESCARTESTM\\+', 'g'), '<span class="descartesTM">Descartes</span>');

        // Highligh search matches
        if (search !== '' && search.length > 2) {
            text = text.replace(new RegExp(escapeRegex(search), "gi"), '<span class="help_match">$&</span>');
        }

        return text;
    };

    /**
     * Searches the help database contents for the given phrase,
     * and displays all help topics that return a match in the list.
     *
     * @param  {String} phrase The phrase to search for in the help database
     */
    Help.prototype.searchHelp = function(search) {
        this.searching = true;

        /**
         * Removes any search highlights from the given text
         *
         * @param {String} text The text from which to remove search highlights
         * @return {String} The given text, with search highlights removed
         */
        function clearMatches(text) {
            return text.replace(/<span class="help_match">([^<]*)<\/span>/gi, '$1');
        }

        /**
         * Escapes the given string for use in building a dynamic regex pattern
         *
         * @param  {String} str The string to escape
         * @return {String}     The escaped string, safe for use inside a regex pattern
         */
        function escapeRegex(str) {
            return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }

        // Encode HTML to avoid matching html inside article text
        phrase = escapeRegex(view.encodeHTML(search));

        // Do a global, case-insensitive search
        var re = new RegExp(phrase, "gi");

        // If search term not longer than 2 characters, only clear
        // current search highlights and return
        if (phrase.length <= 2) {
            // Clear existing matches
            var newText = clearMatches($('div#helptext').html());
            $('div#helptext').html(newText);

            return;
        }

        // Search in currently displayed article
        // Remove old matches first, then highlight new ones!
        var oldText = clearMatches($('div#helptext').html());
        var newText = oldText.replace(re, '<span class="help_match">$&</span>');
        $('div#helptext').html(newText);

        // Search in all other articles
        var matches = controller.getHelpArticles("search=" + search);
        this.synchronizeArticles(matches);
    };

    Help.prototype.selectHelpCategory = function(catid) {
        this.synchronizeSubCategories(this.helpcategories[catid]["subcategories"]);
        this.synchronizeArticles([]);

        $('#helpcategories > input').removeClass('activebtn');
        $('#helpcategories > input[data-id="' + catid + '"]').addClass('activebtn');
    };

    Help.prototype.selectHelpSubCategory = function(category, setMainCategory) {
        if (setMainCategory === true) {
            var cat = this.getMainCategoryForSub(category);
            this.selectHelpCategory(cat);
        }

        var articles = controller.getHelpArticles("cat=" + category);
        view.tabs.help.synchronizeArticles(articles);

        $('#helpsubcategories > a').removeClass('help_current');
        $('#helpsubcategories > a[data-id="' + category + '"]').addClass('help_current');
    };

    Help.prototype.selectHelpArticle = function(article) {
        view.tabs.help.showHelpArticle(view.tabs.help.articles[article]);
    };

    return Help;
});
