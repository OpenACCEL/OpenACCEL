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

define(["model/analyser/passes/quantitypass",
        "model/analyser/passes/dependencypass",
        "model/quantity",
        'underscore'
    ],
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
             * Object containing a partitioning of all quantities into the
             * different categories.
             *
             * @type {map<[1-4], map<String, Quantity>>}
             */
            this.categories = {1: {}, 2: {}, 3: {}, 4: {}};
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
         * Returns an object containing all quantities of the given
         * category
         *
         * @param {Integer} cat The category of which to return all quantities
         * @return {map<String, Quantity>} Object containing all quantities in
         * category cat.
         */
        Analyser.prototype.getQuantitiesByCategory = function(cat) {
            return this.categories[cat];
        };

        /**
         * Resets this.categories to initial empty value.
         */
        Analyser.prototype.resetCategoryStores = function() {
            this.categories = {1: {}, 2: {}, 3: {}, 4: {}};
        };

        /**
         * Returns an object containing all category 2 quantities,
         * keyed by quantity name.
         */
        Analyser.prototype.getOutputQuantities = function() {
            return this.getQuantitiesByCategory(2);
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
         * @return {Quantity} The last quantity defined in the given script.
         */
        Analyser.prototype.analyse = function(script, quantities, autoSave) {
            if (!quantities) {
                throw new Error('Analyser.analyse.pre violated:' +
                    'quantities is null or undefined');
            }

            // Quantity most recently processed and added. Any comments that follow
            // are assigned to this quantity 
            var prevQuantity = null;

            // List of all quantities parsed from the given source
            var added = [];

            var lines = script.split("\n");
            lines.forEach((function(line) {
                line = line.trim();

                // Only process non-blank lines
                if (line.replace(/ +?/g, '') != '') {
                    // Handle comments
                    if (line.substring(0, 2) == '//') {
                        // Ignore comments on first line of script, only handle
                        // those appearing _after_ a quantity definition
                        if (prevQuantity != null) {
                            // Comments can span multiple lines!
                            prevQuantity.comment.push(line.substring(2, line.length));
                        }
                    } else {
                        // Actual quantity definition: apply all passes
                        for (var i = 0; i < this.passes.length; i++) {
                            prevQuantity = this.passes[i].analyse(line, prevQuantity, quantities);
                        }

                        added.push(prevQuantity);
                    }
                }
            }).bind(this));

            return added;
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
            this.resetCategoryStores();
            this.scriptComplete = true;

            // Loop through all quantities
            for (var qtyName in quantities) {
                var qty = quantities[qtyName];
                var category = 0;

                // If the quantity has not been defined yet, set category to 0
                if (qty.todo) {
                    // Flag script as incomplete
                    this.scriptComplete = false;
                    quantities[qtyName].category = 0;
                    continue;
                }

                qty.input.type = this.findUserInput(qty.definition);
                if (qty.input.type !== null) {
                    // The quantity has an input element, so it is category 1
                    category = 1;
                    qty.input.parameters = this.findInputParameters(qty.definition, qty.input.type);
                } else if (qty.reverseDeps.length === 0) {
                    // If there are no quantities that depend on this quantity, it is category
                    // 2 (output)
                    category = 2;
                } else if (qty.dependencies.length === 0) {
                    // If the quantity has no dependencies, it is a category 3 (input) quantity
                    category = 3;
                } else {
                    // Has both dependencies and quantities that depend on this quantity: category 4
                    category = 4;
                }

                // Add the quantity to the corresponding category set and set
                // the category on the quantity itself
                quantities[qtyName].category = category;
                this.categories[category][qtyName] = qty;
            }

            return quantities;
        };

        /**
         * Determines whether the quantity is a user input and determines the type of the user input.
         * Returns null if the quantity is not defined by user input (is not category I).
         * @param  {String} definition the definition of the desired quantity
         * @pre definition != null && definition != undefined
         * @return {String} 'slider' if the input element is a slider,
         * 'check' if the input element is a check box,
         * 'button' if the input element is a button,
         * 'text' if the input element is a text field,
         * null if the quantity is not category 1
         */
        Analyser.prototype.findUserInput = function(definition) {
            if (!definition) {
                throw new Error('Analyser.findUserInput.pre violated:' +
                    'definition is undefined or null');
            }
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

        /**
         * Finds the input parameter of input elements.
         * @param  {String} definition the definition of the quantity that defines the input element
         * @param  {String} type the type of the input element (can be null)
         * @pre definition != null && definition != undefined
         * @return {Object[]} the parameters of the input elements, or the empty array if no parameters are found
         * parameters can be Strings or Numbers
         */
        Analyser.prototype.findInputParameters = function(definition, type) {
            if (!definition) {
                throw new Error('Analyser.findInputParameters.pre violated:' +
                    'definition is null or undefined')
            }
            var parameters = [];
            if (type === 'slider') {
                parameters = definition.match(/slider\((\s*-*\s*\d+[.\d]*)\s*,(\s*-*\s*\d+[.\d]*)\s*,(\s*-*\s*\d+[.\d]*)\s*\)/);
            } else if (type === 'check') {
                parameters = definition.match(/check\(\s*(true|false)\s*\)/);
            } else if (type === 'text') {
                parameters = definition.match(/input\(\s*(?:\'|\")(\w+)(?:\'|\")\s*\)/);
            }
            return parameters.slice(1);
        };

        // Exports all macros.
        return Analyser;
    });
