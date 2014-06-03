/*
 * The analyser extracts information of the script.
 *
 * @author Roy Stoof
 */

/* Browser vs. Node ***********************************************/
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

define(["model/passes/analyser/quantitypass",
        "model/passes/analyser/dependencypass"
    ],
    /**@lends Analyser*/
    function(QuantityPass, DependencyPass, CategoryPass) {
        /**
         * @class Analyser
         * @classdesc The analyser analyses a line of script and updates the quantities of the script accordingly.
         */
        function Analyser() {
            /**
             * An array of AnalyserPasses that are performed on each line of ACCEL code.
             * It is an array instead of a dictionary because the order of pass execution matters.
             *
             * @type {AnalyserPass[]}
             */
            this.passes = [];
            this.passes.push(new QuantityPass());
            this.passes.push(new DependencyPass());

            /**
             * Whether there are no todo quantities in the script.
             *
             * @type {Boolean}
             */
            this.scriptComplete = true;

            /**
             * Object containing all category 2 (output) quantities, keyed by name.
             *
             * @type {map<String, Quantity>}
             */
            this.outputQuantities = {};
        }

        /**
         * Performs all
         *
         * @param {String} line A single line of input code.
         * @return {Object} An object containing all the quantities in the script.
         */
        Analyser.prototype.analyse = function(line, quantities) {
            for (var i = 0; i < this.passes.length; i++) {
                quantities = this.passes[i].analyse(line, quantities);
            }

            return quantities;
        };

        /**
         * Returns whether there are no todo-items.
         *
         * @return this.scriptComplete
         */
        Analyser.prototype.isScriptComplete = function() {
            return this.scriptComplete;
        };

        /**
         * Returns an object containing all category 2 quantities,
         * keyed by quantity name.
         */
        Analyser.prototype.getOutputQuantities = function() {
            return this.outputQuantities;
        };

        /**
         * Determines the categories of all quantities and checks whether the script is
         * complete (no todo-items).
         *
         * @param {Object} quantities The set of quantities to analyse
         * @return quantities, with category attribute set
         * @modifies quantities, this.scriptComplete
         */
        Analyser.prototype.determineCategories = function(quantities) {
            this.scriptComplete = true;
            this.outputQuantities = {};

            // Loop through all quantities
            for (var qtyName in quantities) {
                var qty = quantities[qtyName];

                // If the quantity has not been defined yet, set category to 0
                if (qty.todo) {
                    // Flag script as incomplete
                    this.scriptComplete = false;
                    quantities[qtyName].category = 0;
                    continue;
                }

                // If the quantity has no dependencies, it is a category 3 (input) quantity
                if (qty.dependencies.length == 0) {
                    // TODO check whether it's a category 1 user input
                    quantities[qtyName].category = 3;
                } else {
                    // If there are no quantities that depend on this quantity, it is category
                    // 2 (output)
                    if (qty.reverseDeps.length == 0) {
                        quantities[qtyName].category = 2;
                        this.outputQuantities[qtyName] = qty;
                    } else {
                        // Has both dependencies and quantities that depend on this quantity: category 4
                        quantities[qtyName].category = 4;
                    }
                }
            }

            return quantities;
        };

        // Exports all macros.
        return Analyser;
    });