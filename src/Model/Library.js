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
        this.lib = {};

        /**
         * A list of function names, escaped where nessecary.
         *
         * @type {Array}
         */
        this.escapedFunctions = [];

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
    Library.prototype.load = function() {
        try {
            this.fileLoader.load("ACCEL", "libfile");
            this.lib = this.fileLoader.getLibFile();
        } catch (e) {
            // Unrecoverable error: the ACCEL library metadata could not be loaded!
            console.log(e.message);
        }
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
     *  - {Boolean} escaped Whether to escape function names that would otherwise
     *      cause name clashes with existing javascript functions. Functions are escaped according
     *      to the 'rewrite rules' specified in this.replaceNames.
     *  - {Boolean} inputs Whether to include input functions
     *
     * @return {Array} A list of function names, filtered in accordance with the given options object
     */
    Library.prototype.getFunctions = function(options) {
        var ans = [];

        // Load library first if not already loaded!
        if (this.lib === {}) {
            this.load();
        }

        if (options.escaped) {
            // Return saved list if we already escaped the functions list before.
            // Else do it now
            if (this.escapedFunctions.length > 0) {
                ans = this.escapedFunctions;
            } else {
                ans = this.escapedFunctions = this.escape(this.lib.standard_functions);
            }
        } else {
            ans = this.lib.standard_functions;

            // Append input functions if requested
            if (options.inputs) {
                ans = ans.concat(this.lib.input_functions);
            }
        }

        return ans;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Library;
});
