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
define(['model/compiler'], /**@lends */ function(Compiler) {

    /**
     * Object keeping the track of the list of 'reserved' functions.
     * Call getList() to retrieve the list.
     * The is only generated once.
     * @type {Object}
     */
    var FunctionList = {
        /**
         * Generates the list of predefined functions
         */
        generateList: function() {
            this.list = [];
            var match;
            var compiler = new Compiler();
            var lib = compiler.fileLoader.getLibrary();
            var pattern = /(?:function\s*)(\w*)(?:\()/g;
            while (match = pattern.exec(lib)) {
                this.list.push(match[1]);
            }
            pattern = /(?:let\s*)(\w*)/g;
            var macro = compiler.fileLoader.getMacros();
            while (match = pattern.exec(macro)) {
                this.list.push(match[1]);
            }
        },

        /**
         * Returns the list of predefined functions.
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
    return FunctionList;
});