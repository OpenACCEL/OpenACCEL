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
    function Script(source) {

        /**
         * The source of the ACCEL script, as provided by the user.
         * @type {String}
         */
        this.source = '';

        /**
         * The executable javascript code representing the ACCEL model
         * as stored in the source attribute.
         * @type {String}
         */
        this.exe = null;

        /**
         * Contains the quantities that together make up the ACCEL script.
         * @type {Quantity[]}
         */
        this.quantities = {};

        this.compiler = new Compiler();
        this.analyser = new Analyser();

        if (typeof source !== 'undefined') {
            // Source code is given, initialize.
            var lines = source.split("\n");
            lines.forEach((function(line) {
                this.addQuantity(line);
            }).bind(this));
        }
    }

    Script.prototype = {

        isComplete: function() {
            return this.analyser.scriptComplete;
        },

        /**
         * Returns whether the quantity is in the script.
         *
         * @param qtyname The name of the quantity
         * @return qtyName in quantities
         */
        hasQuantity: function(qtyName) {
            return qtyName in this.quantities;
        },

        /**
         * Add quantity to quantities and recompiles the script.
         * @param {String} source a line in the script as provided by the user
         * @pre source is in the format x(a) = 'definition', where a can be empty.
         * @modifies quantities
         */
        addQuantity: function(source) {
            // Analyse the added line of code and add the defined quantity to the model
            this.quantities = this.analyser.analyse(source, this.quantities);

            this.scriptChanged();
            
            return this.quantities;
        },

        /**
         * Deletes the given quantity from the script if it's in there,
         * or sets it as todo-item if nessecary
         *
         * @param qtyName The name of the quantity to delete
         * @modifies quantities
         */
        deleteQuantity: function(qtyName) {
            if (!this.hasQuantity(qtyName)) {
                throw new Error('Script.prototype.deleteQuantity.pre :' +
                'quantity does not exist')
            }

            // If other quantities depend on this quantity, set it as
            // todo and delete it's definition.
            if (this.quantities[qtyName].reverseDeps.length > 0) {
                this.quantities[qtyName].markAsTodo();
            }

            this.scriptChanged();
        },


        setValue: function(qtyName, value) {

        },

		/**
		 * Does all things that should be done when the script has changed.
		 *
		 * Call this method when quantities has been modified.
		 */
        scriptChanged: function() {
            // Determine categories of all quantities
            this.analyser.determineCategories(this.quantities);
        },


        getQuantity: function(qtyName) {
            return eval("this.exe." + qtyName + "();");
        },

        getQuantities: function() {
            return this.quantities;
        },

        /**
         * Returns the code of the script as a single string.
         *
         * @param {Boolean} includeUnits Whether to include the units in the string representation
         * @modifies source
         */
        toSource: function(includeUnits) {
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
            
            return this.source;
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Script;
});