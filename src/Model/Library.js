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
            console.log("Unrecoverable error: the ACCEL library metadata file could not be loaded!");
        }
    };

    /**
     * Returns the list of ACCEL function names, escaped where nessecary to avoid name clashes.
     * Escaping is done according to the rewrite rules as specified in this.replaceNames.
     * 
     * @return {Array} The names of all supported ACCEL functions, escaped when nessecary.
     */
    Library.prototype.escape = function() {
        if (this.escapedFunctions.length > 0) {
            return this.escapedFunctions;
        }

        if (this.lib === {}) {
            this.load();
        }

        // Make a (shallow) clone of the original function names array
        this.escapedFunctions = this.lib.function_names.slice(0);

        var escape = Object.keys(this.replaceNames);

        // For each element in the array, check whether it needs to be escaped and with what
        for (var elem in this.escapedFunctions) {
            var funcName = this.escapedFunctions[elem];
            var escIndex = escape.indexOf(funcName);
            if (escIndex !== -1) {
                this.escapedFunctions[elem] = this.replaceNames[funcName];
            } 
        }

        return this.escapedFunctions;
    };

    /**
     * Returns a list of all supported ACCEL library functions, optionally escaped.
     * @param  {Boolean} escaped Whether to escape function names that would otherwise
     * cause name clashes with existing javascript functions. Functions are escaped according
     * to the 'rewrite rules' specified in this.replaceNames.
     * 
     * @return {Array} A list of function names, optionally escaped
     */
    Library.prototype.getFunctionNames = function(escaped) {
        if (escaped === true) {
            return this.escape();
        } else {
            if (this.lib === {}) {
                this.load();
            }

            return this.lib.function_names;
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Library;
});
