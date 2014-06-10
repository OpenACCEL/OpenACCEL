/*
 * Interface for Quantity Stores.
 *
 * A Quantity Store is an object that can store and retrieve quantities
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

define([], /**@lends Model*/ function() {
    /**
     * @class
     * @classdesc 
     */

    function AbstractQuantityStore() {
    }

    AbstractQuantityStore.prototype = {
        /**
         * Returns an array containing the names of all the quantities in this store.
         *
         * @return {String[]} An array containing all the quantity names in the store.
         */
        getQuantities: function() {},

        /**
         * Saves the quantity with the given name and definition to the store.
         *
         * @param {String} qtyname The name of the quantity to store.
         * @param {String} def The definition of the quantity to store.
         */
        saveQuantity: function(qtyName, def) {},

        /**
         * Retrieves the quantity with the given name from the store.
         *
         * @param {String} qtyName The name of the quantity to load from the store
         * @return The definition of the quantity with name qtyName, or null if there
         * is no quantity in the store named qtyName.
         */
        loadQuantity: function(qtyName) {},

        /**
         * Deletes the quantity with the given name from the store.
         *
         * @param {String} qtyName The name of the quantity to delete
         */
        deleteQuantity: function(qtyName) {},

        /**
         * Returns whether a quantity with name qtyName exists in the store.
         *
         * @return Whether there is a quantity named qtyName present in the store.
         */
        hasQuantity: function(qtyName) {},

        /**
         * Returns the number of quantities stored in this store.
         *
         * @return The number of quantities currently stored in the store.
         */
        numQuantities: function() {},
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AbstractQuantityStore;
});
