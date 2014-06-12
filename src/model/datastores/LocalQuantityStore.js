/*
 * A QuantityStore that stores quantities in localStorage.
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
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

define(["model/datastores/AbstractQuantityStore", 
        "underscore"], /**@lends Model*/ function(AbstractQuantityStore, _) {
    /**
     * @class
     * @classdesc This class can load and save quantities to localStorage.
     */

    function LocalQuantityStore() {
        // Create empty index if there is no index already!
        if (inBrowser && window.localStorage) {
            if (localStorage.getItem('quantities') == null) {
                localStorage.setItem('quantities', '[]');
            } else {
                // Validate index of quantities stored in the localStorage
                this.validateIndex();
            }
        }
    }

    LocalQuantityStore.prototype = new AbstractQuantityStore();

    /**
     * Returns an array containing the names of all the quantities in this store.
     *
     * @param {Boolean} validate (Optional) Whether to validate the index of quantities
     * that are in the store.
     * @return {String[]} An array containing all the quantity names in the store.
     */
    LocalQuantityStore.prototype.getQuantities = function(validate) {
        if (typeof(validate) === 'undefined') {
            validate = true;
        }

        // Validate index of quantities stored in the localStorage
        if (validate) {
            this.validateIndex();
        }

        return JSON.parse(localStorage.getItem('quantities'));
    };

    /**
     * Saves the quantity with the given name and definition to the store.
     * Overwrites any quantities already present in the store that have the
     * same name.
     *
     * @param {String} qtyname The name of the quantity to store.
     * @param {String} def The definition of the quantity to store.
     */
    LocalQuantityStore.prototype.saveQuantity = function(qtyName, def) {
        // Add to index if not already in there
        if (!this.hasQuantity(qtyName)) {
            var quantities = this.getQuantities(false);
            quantities.push(qtyName);
            localStorage.setItem('quantities', JSON.stringify(quantities));
        }

        localStorage.setItem(qtyName, def);
    };

    /**
     * Retrieves the quantity with the given name from the store.
     *
     * @param {String} qtyName The name of the quantity to load from the store
     * @return The definition of the quantity with name qtyName, or null if there
     * is no quantity in the store named qtyName.
     */
    LocalQuantityStore.prototype.loadQuantity = function(qtyName) {
        return localStorage.getItem(qtyName);
    };

    /**
     * Deletes the quantity with the given name from the store.
     *
     * @param {String} qtyName The name of the quantity to delete
     */
    LocalQuantityStore.prototype.deleteQuantity = function(qtyName) {
        localStorage.removeItem(qtyName);
        var quantities = _.without(this.getQuantities(false), qtyName);
        localStorage.setItem('quantities', JSON.stringify(quantities));
    };

    /**
     * Clears the entire store, deleting all quantities from it.
     */
    LocalQuantityStore.prototype.clear = function() {
        // Can't simply use localStorage.clear() as there may be other
        // things in the storage besides the quantities!
        var quantities = this.getQuantities(false);
        for (var i = 0; i < quantities.length; i++) {
            var qtyName = quantities[i];
            localStorage.removeItem(qtyName);
        }

        localStorage.setItem('quantities', '[]');
    };

    /**
     * Returns whether a quantity with name qtyName exists in the store.
     *
     * @return Whether there is a quantity named qtyName present in the store.
     */
    LocalQuantityStore.prototype.hasQuantity = function(qtyName) {
        if (localStorage.getItem(qtyName) == null) {
            return false;
        } else {
            return true;
        }
    };

    /**
     * Returns the number of quantities stored in this store.
     *
     * @return The number of quantities currently stored in the store.
     */
    LocalQuantityStore.prototype.numQuantities = function() {
        this.validateIndex();

        return JSON.parse(localStorage['quantities']).length;
    };

    /**
     * Checks whether all quantities in the index really
     * still exist in the localStorage and creates an empty
     * index if there is none. Removes any missing
     * quantities from the index.
     *
     * @modifies localStorage['quantities']
     * @post All quantities in localStorage['quantities'] are
     * really present in the store and the index is valid.
     */
    LocalQuantityStore.prototype.validateIndex = function() {
        // Get current index and make sure it exists
        var index = localStorage.getItem('quantities');
        if (index != null) {
            var quantities = JSON.parse(index);

            // Identify all items that are missing in the store
            var deleted = [];
            for (var i = 0; i < quantities.length; i++) {
                var qtyName = quantities[i];
                if (localStorage.getItem(qtyName) == null) {
                    // Add to quantities array to be deleted
                    deleted.push(qtyName);
                }
            }

            // Delete all missing quantities from the index array of quantities
            quantities = _.difference(quantities, deleted);
            localStorage.setItem('quantities', JSON.stringify(quantities));
        } else {
            // Restore empty index
            localStorage.setItem('quantities', '[]');
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return LocalQuantityStore;
});
