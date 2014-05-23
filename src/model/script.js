/**
 *
 * @author Jacco Snoeren
 */

/** Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define(["model/compiler", "model/analyser", "model/quantity"], function(Compiler, Analyser, Quantity) {
    /**
     * @class Script
     * @classdesc The Script class represents an ACCEL script/model, containing the defined quantities,
     * compiled executable and source code.
     */
    function Script(source) {
        this.compiler = new Compiler();
        this.analyser = new Analyser();

        /**
         * The source of the ACCEL script, as provided by the user.
         *
         * @type {String}
         */
        this.source = '';

        /**
         * Whether the script has been modified since the
         * last time that this.toSource() was called.
         *
         * @type {Boolean}
         */
        this.scriptModified = false;

        /**
         * The executable javascript code representing the ACCEL model
         * as stored in the source attribute.
         *
         * @type {String}
         */
        this.exe = null;

        /**
         * Contains the quantities that together make up the ACCEL script.
         *
         * @type {map<String, Quantity>}
         */
        this.quantities = {};

        // TODO store array of quantity names to preserve the order in which
        // they were defined

        if (typeof source !== 'undefined') {
            // Source code is given, initialize.
            var lines = source.split("\n");
            lines.forEach((function(line) {
                this.addQuantity(line);
            }).bind(this));
        }
    }


    Script.prototype = {

        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        isComplete: function() {
            return this.analyser.isScriptComplete() && Object.keys(this.quantities).length > 0;
        },

        /**
         * Returns whether the quantity is in the script.
         *
         * @param {String} qtyname The name of the quantity
         * @return qtyName in quantities
         */
        hasQuantity: function(qtyName) {
            return qtyName in this.quantities;
        },

        /**
         * Returns an object with quantity names as keys and the corresponding
         * Quantity objects as values
         *
         * @return this.quantities
         */
        getQuantities: function() {
            return this.quantities;
        },

        /**
         * Returns an object containing all category 2 quantities, keyed
         * by quantity name, and containing their current values if the script
         * can be executed.
         *
         * @return this.analyser.getOutputQuantities()
         */
        getOutputQuantities: function() {
            var cat2quantities = this.analyser.getOutputQuantities();

            // Populate object with quantity values if script can be evaluated
            if (this.isComplete()) {
                for (q in cat2quantities) {
                    cat2quantities[q].value = this.getQuantityValue(q);
                }
            }

            return cat2quantities;
        },

        /**
         * Returns the quantity with the given name.
         *
         * @param {String} qtyName The name of the quantity to return.
         * @pre this.hasQuantity(qtyName)
         * @return this.quantities[qtyName]
         */
        getQuantity: function(qtyName) {
            if (!this.hasQuantity(qtyName)) {
                throw new Error('Script.prototype.getQuantity.pre :' +
                'no Quantity named qtyName')
            }

            return this.quantities[qtyName];
        },

        /**
         * Returns the value of the quantity with the given name
         *
         * @param {String} qtyName The name of the quantity of which to return the value
         * @pre this.hasQuantity(qtyName) && !this.quantities[qtyName].todo
         * @return this.quantities[qtyName]
         */
        getQuantityValue: function(qtyName) {
            if (!this.hasQuantity(qtyName)) {
                throw new Error('Script.prototype.getQuantityValue.pre :' +
                'no Quantity named qtyName')
            }
            if (this.quantities[qtyName].todo) {
                throw new Error('Script.prototype.getQuantityValue.pre :' +
                'quantity qtyName undefined (todo)!')
            }

            return eval("this.exe." + qtyName + "();");
        },
        

        /**
         * Adds the quantity defined in source to the script. If the quantity already exists,
         * it's definition is updated.
         *
         * @param {String} source The definition of the quantity to be added, as specified by the user
         * @pre true
         * @modifies quantities
         * @post The quantity defined in source has been added to the script, the category of all
         * quantities has been re-evaluated and the script has been recompiled if complete.
         */
        addQuantity: function(source) {
            // Analyse the added line of code and add the defined quantity to the model
            this.quantities = this.analyser.analyse(source, this.quantities);
            this.scriptChanged();
        },

        /**
         * Deletes the given quantity from the script if it's in there,
         * or sets it as todo-item if nessecary
         *
         * @param qtyName The name of the quantity to delete
         * @pre this.hasQuantity(qtyName) && !this.quantities[qtyname].todo
         * @post The quantity named qtyName has been deleted from the script or set as todo, 
         * the category of all quantities has been re-evaluated and the script has
         * been recompiled if complete.
         * @modifies quantities
         */
        deleteQuantity: function(qtyName) {
            if (!this.hasQuantity(qtyName)) {
                throw new Error('Script.prototype.deleteQuantity.pre :' +
                'quantity does not exist')
            }
            if (!this.quantities[qtyname].todo) {
                throw new Error('Script.prototype.deleteQuantity.pre :' +
                'quantity cannot be deleted: is a todo item')
            }

            var qty = this.quantities[qtyName];

            // Delete all dependencies of this quantity that are marked as todo and have no other reverse dependencies!
            qty.dependencies.forEach((function(d) {
                if (this.quantities[d].todo) {
                    if (this.quantities[d].reverseDeps == [qtyName]) {
                        // We are the only quantity depending on it, so delete it
                        delete this.quantities[d];
                    } else {
                        // Remove us from reverse-dependency list
                        delete this.quantities[d].reverseDeps[qtyname];
                    }
                }
            }).bind(this));

            // If there are quantities depending on this quantity, mark it as todo but do not
            // delete it from the object
            if (qty.reverseDeps.length > 0) {
                this.quantities[qtyName].markAsTodo();
            } else {
                for (var i = 0; i < this.quantities[qtyName].dependencies.length; i++) {
                    var dependency = this.quantities[qtyName].dependencies[i];
                    if (this.quantities[dependency].todo) {
                        deleteQuantity(dependency);
                    }
                }
                delete this.quantities[qtyName];
            }

            // If it has no reverse dependencies, delete it entirely
            else {
                delete this.quantities[qtyName];
            }

            this.scriptChanged();
        },

        /**
         * Sets the value of a category 1 user input quantity.
         *
         * @param {String} qtyName The name of the category 1 quantity to set the value of
         * @param {Number} value The value to give to the Quantity with name qtyName
         * @pre qtyName in this.quantities && this.quantities[qtyName].category == 1
         */
        setConstant: function(qtyName, value) {
            if(!this.hasQuantity(qtyName)) {
                throw new Error('Script.prototype.setConstant.pre :' +
                'no Quantity named qtyName')
            }
            if(this.quantities[qtyName].category != 1) {
                throw new Error('Script.prototype.setConstant.pre :' +
                'Quantity qtyName is not of category 1')
            }

            // TODO implementation
        },

        /**
         * Does all things that should be done when the script has changed:
         * - Re-evaluates the category of all quantities
         *
         * Call this method when this.quantities has been modified.
         *
         * @modifies this.quantities
         * @post The categories of all quantities have been determined and set.
         */
        scriptChanged: function() {
            this.scriptModified = true;
            
            // Determine categories of all quantities
            this.analyser.determineCategories(this.quantities);
        },

        /**
         * Returns the code of the script as a single string.
         *
         * @param {Boolean} includeUnits (optional) Whether to include the units in the string representation
         * @modifies source
         */
        toSource: function(includeUnits) {
            // Make parameter optional by setting value if undefined
            if (typeof includeUnits === 'undefined') {
                includeUnits = false;
            }

            // If the script has not been modified since the last call to toSource, return
            // the cached value instead of re-evaluating
            if (!this.scriptModified) {
                return this.source;
            }

            // Iterate through all quantities and append their string representation to the source code
            var lines = [];
            for (var qtyName in this.quantities) {
                var qty = this.quantities[qtyName];

                // Do not include quantities in the script string that are undefined!
                if (!qty.todo) {
                    lines.push(qty.toString(includeUnits));
                }
            }

            this.source = lines.join("\n");
            this.scriptModified = false;
            
            return this.source;
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Script;
});
