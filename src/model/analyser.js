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
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define(["model/passes/analyser/quantitypass",
        "model/passes/analyser/dependencypass",
<<<<<<< HEAD
        "model/quantity",
        'underscore'],
=======
        "model/quantity"
    ],
>>>>>>> 3c2235adc85d11fa753123d1bfe5b5bc769070ea
    /**@lends Analyser*/
    function(QuantityPass, DependencyPass, Quantity, _) {
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
            this.scriptComplete = false;

            /**
             * Object containing all category 2 (output) quantities, keyed by name.
             *
             * @type {map<String, Quantity>}
             */
            this.outputQuantities = {};
        }

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
         * Performs all analysis passes on the given piece of ACCEL script
         *
         * @param {String} script A piece of ACCEL script, consisting of an arbitrary
         * number of lines. Comments should follow quantity definitions: if there is a
         * comment on the first line it will be ignored.
         * @param {Object} quantities The current quantities in the script.
         * @modifies quantities
         * @post quantities contains all the quantities defined in script
         */
        Analyser.prototype.analyse = function(script, quantities) {
            if (!quantities) {
                throw new Error('Analyser.analyse.pre violated:' +
                    'quantities is null or undefined');
            }

            // Perform the relevant passes on each line
            var prevQuantity = null;
            var lines = script.split("\n");

            lines.forEach((function(line) {
                line = line.trim();

                // Check whether it's a comment line
                if (prevQuantity != null && line.substring(0, 2) == '//') {
                    prevQuantity.comment = line.substring(2, line.length);
                } else {
                    for (var i = 0; i < this.passes.length; i++) {
                        prevQuantity = this.passes[i].analyse(line, prevQuantity, quantities);
                    }
                }
            }).bind(this));
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
                    qty.input.type = this.findUserInput(qty.definition);
                    if (qty.input.type !== null) {
                        quantities[qtyName].category = 1;
                        qty.input.parameters = this.findInputParameters(qty.definition, qty.input.type);
                    } else {
                        quantities[qtyName].category = 3;
                    }
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

        Analyser.prototype.findUserInput = function(definition) {
            if (definition.match(/slider\(/)) {
                return 'slider';
            } else if (definition.match(/check\(/)) {
                return 'check';
            } else if (definition.match(/button\(/)) {
                return 'button';
            } else if (definition.match(/input\(/)) {
                return 'text';
            } else {
                return null;
            }
        };

        Analyser.prototype.findInputParameters = function(definition, type) {
            var parameters = [];
            if (type === 'slider') {
                parameters = definition.match(/slider\((\d+),(\d+),(\d+)\)/);
            } else if (type === 'check') {
                parameters = definition.match(/check\((true|false)\)/);
            } else if (type === 'text') {
                parameters = definition.match(/input\((\'\w+\')\)/)
            }
            return parameters.slice(1);
        }

        // Exports all macros.
        return Analyser;
    });
