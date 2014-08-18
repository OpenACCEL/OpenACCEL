/*
 * The Library object represents the ACCEL function library and contains all
 * metadata information about it. This includes function names, categories and help texts.
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

define(["Model/FileLoader"], /**@lends Model.Library */ function(FileLoader) {
    /**
     * @class
     * @classdesc Represents the ACCEL function library including all it's metadata.
     *
     * This is a singleton class: there can be only a single instance of it.
     */
    function Library(source) {
        /**
         * The fileloader used to load the library .json file
         *
         * @type {FileLoader}
         */
        this.fileLoader = new FileLoader();

        /**
         * The JSON object containing the ACCEL library metadata.
         *
         * @type {Object}
         */
        this.functions = {};

        /**
         * The database of help articles, partitioned into categories.
         *
         * @type {Object}
         */
        this.help = {};

        /**
         * List of available demoscripts.
         *
         * @type {Array}
         */
        this.demoscripts = [];

        /**
         * The function names to escape, should they be used in the library as names of functions.
         * Each key in the array should be replaced by it's value.
         *
         * @type {Object}
         */
        this.replaceNames = {
            "do": "__do__",
            "if": "__if__"
        };
    }

    /**
     * Loads the ACCEL library metadata into memory and parses it.
     */
    Library.prototype.loadFunctions = function() {
        try {
            //this.fileLoader.load("ACCEL_functions", "libfile");
            this.functions = this.fileLoader.getLibFile("ACCEL_functions");
        } catch (e) {
            // Unrecoverable error: the ACCEL library metadata could not be loaded!
            console.log(e.message);
        }
    };

    /**
     * Loads the ACCEL library metadata into memory and parses it.
     */
    Library.prototype.loadHelp = function() {
        try {
            //this.fileLoader.load("ACCEL_help", "libfile");
            this.help = this.fileLoader.getLibFile("ACCEL_help").help_articles;
        } catch (e) {
            // Unrecoverable error: the ACCEL library metadata could not be loaded!
            console.log(e.message);
        }
    };

    /**
     * Loads the list of available demo scripts.
     */
    Library.prototype.loadDemos = function() {
        try {
            //this.fileLoader.load("ACCEL_help", "libfile");
            this.demoscripts = this.fileLoader.getDemoScripts();
        } catch (e) {
            // Unrecoverable error: the ACCEL library metadata could not be loaded!
            console.log(e.message);
        }
    };

    /**
     * Returns a map of all available help articles.
     *
     * @return {Object} A map of all help articles, indexed first by category
     * and then by article name. An article is thus accessed by categoryName.articleName.
     */
    Library.prototype.getHelpArticles = function() {
        if (Object.keys(this.help).length === 0) {
            this.loadHelp();
        }

        return this.help;
    };

    /**
     * Returns a list containing the names of all available demo scripts.
     *
     * @return {Array} A list with the names of all available demo scripts.
     */
    Library.prototype.getDemoScripts = function() {
        if (Object.keys(this.demoscripts).length === 0) {
            this.loadDemos();
        }

        return this.demoscripts;
    };

    /**
     * Loads the demo with the given name and returns it's source
     *
     * @param  {String} demo The name of the demo to load
     * @return {String} The source code of the demo with the given name
     */
    Library.prototype.getDemoScript = function(demo) {
        return this.fileLoader.getDemoScript(demo);
    };

    /**
     * Returns the given list of function names, escaped where nessecary to avoid name clashes.
     * Escaping is done according to the rewrite rules as specified in this.replaceNames.
     *
     * @return {Array} The functions list, but now with escaped names where nessecary.
     */
    Library.prototype.escape = function(functions) {
        if (!(functions instanceof Array) || functions.length === 0) {
            throw new Error("Library.prototype.escape.pre violated: non-array or empty array given.");
        }

        // Make a (shallow) clone of the original function names array
        var escapedList = functions.slice(0);

        var escape = Object.keys(this.replaceNames);

        // For each element in the array, check whether it needs to be escaped and with what
        for (var elem in escapedList) {
            var funcName = escapedList[elem];
            var escIndex = escape.indexOf(funcName);
            if (escIndex !== -1) {
                escapedList[elem] = this.replaceNames[funcName];
            }
        }

        return escapedList;
    };

    /**
     * Returns a list of all supported ACCEL library functions, optionally filtered.
     *
     * @param {Object} options An object that can have the following properties:
     *  - {Boolean} standard Whether to include the standard functions, including cond.
     *  - {Boolean} escaped Whether to escape function names that would otherwise
     *      cause name clashes with existing javascript functions. Functions are escaped according
     *      to the 'rewrite rules' specified in this.replaceNames.
     *  - {Boolean} inputs Whether to include input functions
     *  - {Boolean} reserved Whether to include reserved words in the list.
     *      These are words like 'true' and 'PI'.
     *  - {Boolean} all Whether to include all possible functions and reserved words in the list.
     *      Overwrites all other options except escaped.
     *
     * @return {Array} A list of function names, filtered in accordance with the given options object
     */
    Library.prototype.getFunctions = function(options) {
        var ans = [];

        // Load library first if not already loaded!
        if (Object.keys(this.functions).length === 0) {
            this.loadFunctions();
        }

        // Start with just the list of standard functions
        if (options.standard || options.all) {
            ans = ans.concat(this.functions.standard_functions);
        }

        // Append input functions if requested
        if (options.inputs || options.all) {
            ans = ans.concat(this.functions.input_functions);
        }

        // Append reserved words if requested
        if (options.reserved || options.all) {
            ans = ans.concat(this.functions.reserved_words);
        }

        // Escape if requested
        if (options.escaped) {
            ans = this.escape(ans);
        }

        return ans;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Library;
});
