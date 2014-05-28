/*
 * @author Roel Jacobs
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
    sweetModule = "sweet.js";
} else {
    sweetModule = "sweet";
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define(['model/compiler'], /**@lends Model*/ function(Compiler) {
    // List of keywords which may not be altered by passes or macros.
    var keywords = [
        'true',
        'false',
        'slider',
        'input',
        'check',
        'button'
    ];

    /**
     * Object keeping the track of the list of 'reserved' words.
     * Call getList() to retrieve the list.
     * The list is only generated once.
     * @type {Object}
     */
    var ReservedWords = {
        /**
         * Generates the list of reserved words
         */
        generateList: function() {
            this.list = [];
            var match;
            var compiler = new Compiler();
            var lib = compiler.fileLoader.getLibrary();
            var pattern = /(?:function\s*)(\b\w*)(?:\()/g;
            while (match = pattern.exec(lib)) {
                // remove __ if present and add to the list
                this.list.push(match[1].replace(/__/g,""));
            }
            pattern = /(?:let\s*)(\b\w*\b)/g;
            var macro = compiler.fileLoader.getMacros();
            while (match = pattern.exec(macro)) {
                // remove __ if present and add to the list
                this.list.push(match[1].replace(/__/g,""));
            }

            // Add additional keywords.
            for (var i = keywords.length - 1; i >= 0; i--) {
                this.list.push(keywords[i]);
            }

        },

        /**
         * Returns the list of reserved words
         * @return {String} the list of predefined functions
         */
        getList: function() {
            if (!this.list) {
                this.generateList();
            }
            return this.list;
        }
    };


    // Exports are needed, such that other modules may invoke methods from this module file.
    return ReservedWords;
});
