/*
 * An AbstractScriptStore implementati that stores quantities in localStorage.
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

define(["underscore"], /**@lends Model.Datastores*/ function(_) {
    /**
     * @class
     * @classdesc This class can load and save quantities to localStorage.
     */

    function LocalBackupStore() {
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

    /**
     * Returns an array containing the names of all the quantities in this store.
     *
     * @param {Boolean} validate (Optional) Whether to validate the index of quantities
     * that are in the store.
     * @return {String[]} An array containing all the quantity names in the store.
     */
    LocalBackupStore.prototype.getQuantities = function(validate) {
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
    LocalBackupStore.prototype.saveQuantity = function(qtyName, def) {
        // Add to index if not already in there
        if (!this.hasQuantity(qtyName)) {
            var quantities = this.getQuantities(false);
            quantities.push(qtyName);
            localStorage.setItem('quantities', JSON.stringify(quantities));
        }

        localStorage.setItem(qtyName, def);
    };

    /**
     * Saves the entire script source to localStorage.
     *
     * @param {String} source The script source to save
     */
    LocalBackupStore.prototype.saveScript = function(source) {
        localStorage.setItem('scriptSource', source);
    };

    /**
     * Retrieves the quantity with the given name from the store.
     *
     * @param {String} qtyName The name of the quantity to load from the store
     * @return The definition of the quantity with name qtyName, or null if there
     * is no quantity in the store named qtyName.
     */
    LocalBackupStore.prototype.loadQuantity = function(qtyName) {
        return localStorage.getItem(qtyName);
    };

    /**
     * Retrieves the saved script source from the store if present.
     *
     * @return The retrieved script source, or null if there is no
     * script source present in the store.
     */
    LocalBackupStore.prototype.loadScript = function() {
        return localStorage.getItem('scriptSource');
    };

    /**
     * Deletes the quantity with the given name from the store.
     *
     * @param {String} qtyName The name of the quantity to delete
     */
    LocalBackupStore.prototype.deleteQuantity = function(qtyName) {
        localStorage.removeItem(qtyName);
        var quantities = _.without(this.getQuantities(false), qtyName);
        localStorage.setItem('quantities', JSON.stringify(quantities));
    };

    /**
     * Clears the entire store, deleting all quantities and
     * script sources from it.
     */
    LocalBackupStore.prototype.clear = function() {
        this.clearQuantities();
        this.clearScriptSource();
    };

    /**
     * Clears the entire store, deleting all quantities from it.
     */
    LocalBackupStore.prototype.clearQuantities = function() {
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
     * Clears the entire script source from the store
     */
    LocalBackupStore.prototype.clearScriptSource = function() {
        localStorage.removeItem('scriptSource');
    };

    /**
     * Returns whether a quantity with name qtyName exists in the store.
     *
     * @return Whether there is a quantity named qtyName present in the store.
     */
    LocalBackupStore.prototype.hasQuantity = function(qtyName) {
        if (localStorage.getItem(qtyName) == null) {
            return false;
        } else {
            return true;
        }
    };

    LocalBackupStore.prototype.hasScript = function() {
        var source = localStorage.getItem('scriptSource');
        if (source == null) {
            return false;
        } else {
            if (source.trim() == '') {
                return false;
            } else {
                return true;
            }
        }
    };

    /**
     * Returns the number of quantities stored in this store.
     *
     * @return The number of quantities currently stored in the store.
     */
    LocalBackupStore.prototype.numQuantities = function() {
        this.validateIndex();

        return JSON.parse(localStorage['quantities']).length;
    };

    /**
     * Checks whether all quantities in the index really
     * still exist in the localStorage. Removes any missing
     * quantities from the index.
     *
     * @modifies localStorage['quantities']
     * @post All quantities in localStorage['quantities'] are
     * really present in the store.
     */
    LocalBackupStore.prototype.validateIndex = function() {
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
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return LocalBackupStore;
});
