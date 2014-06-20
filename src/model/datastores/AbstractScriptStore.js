/*
 * Interface for Script Stores.
 *
 * A Script Store is an object that can store and retrieve scripts
 * from some arbitrary kind of storage, whether it be local, on a server or
 * on some external storage.
 *
 * @author Edward Brinkmann
 *
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

define([], /**@lends AbstractScriptStore*/ function() {
    /**
     * @class
     * @classdesc 
     */

    function AbstractScriptStore() {
    }

    AbstractScriptStore.prototype = {
        /**
         * Returns an array containing the names of all the scripts in this store.
         *
         * @return {String[]} An array containing all the script names in the store.
         * @abstract
         */
        getScripts: function() {},

        /**
         * Saves the given script source as a script with the given name to the
         * store.
         *
         * @param {String} name The name to give to the script to be stored
         * @param {String} source The source of the script to save in the store.
         * @abstract
         */
        saveScript: function(name, source) {},

        /**
         * Retrieves the script with the given name from the store.
         *
         * @param {String} name The name of the script to load from the store
         * @return {String} The source of the script with name name, or null if there
         * is no script in the store with this name.
         * @abstract
         */
        loadScript: function(name) {}  
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AbstractScriptStore;
});
