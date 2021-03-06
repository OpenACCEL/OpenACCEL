/*
 * The analyser extracts information from the script.
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

define(["Model/Analyser/Passes/QuantityPass",
        "Model/Analyser/Passes/DependencyPass",
        "Model/Quantity",
        "Model/Exceptions/RuntimeError",
        'lodash'
    ],
    /**@lends Model.Analyser*/
    function(QuantityPass, DependencyPass, Quantity, RuntimeError, _) {
        /**
         * @class
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
             * Whether the script contains quantities that have to be optimized
             * by SPEA.
             *
             * @type {Boolean}
             */
            this.optimisation = false;

            /**
             * Object containing a partitioning of all quantities into the
             * different categories.
             *
             * @type {Object.<Number, Object.<String, Quantity>>}
             */
            this.categories = {
                1: {},
                2: {},
                3: {},
                4: {}
            };

            /**
             * Memoization structure for reachability analysis
             *
             * @type {Object}
             */
            this.reachability = {};

            /**
             * The currently constructed (reverse) reachability graph.
             *
             * @type {String}
             */
            this.curReachGraph = [];
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
         * @return {Object.<String, Quantity>} Object containing all quantities in
         * category cat.
         */
        Analyser.prototype.getQuantitiesByCategory = function(cat) {
            return this.categories[cat];
        };

        /**
         * Resets this.categories to initial empty value.
         */
        Analyser.prototype.resetCategoryStores = function() {
            this.categories = {
                1: {},
                2: {},
                3: {},
                4: {}
            };
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
        Analyser.prototype.analyse = function(script, quantities) {
            if (!quantities) {
                throw new Error('Analyser.analyse.pre violated:' +
                    'quantities is null or undefined');
            }

            // Quantity most recently processed and added. Any comments that follow
            // are assigned to this quantity
            var prevQuantity = null;

            // Current line number at which to insert next quantity
            var currentLineNum = Object.keys(quantities).length;

            // List of all quantities parsed from the given source
            var added = [];

            var lines = script.split("\n");
            lines.forEach((function(line) {
                line = line.trim();

                if (line.replace(/ +?/g, '') !== '') {
                    // Handle comments
                    if (line.substring(0, 2) === '//') {
                        // Ignore comments on first line of script, only handle
                        // those appearing _after_ a quantity definition
                        // Also ignore any displayed values in script (prefixed with '////')
                        if (prevQuantity !== null && line.substring(0, 4) !== '////') {
                            // Comments can span multiple lines!
                            prevQuantity.comment.push(line.substring(2, line.length));
                        }
                    } else {
                        // Actual quantity definition: apply all passes
                        for (var i = 0; i < this.passes.length; i++) {
                            prevQuantity = this.passes[i].analyse(line, prevQuantity, quantities);
                        }
                        prevQuantity.linenum = currentLineNum;
                        this.findPareto(prevQuantity);
                        added.push(prevQuantity);
                    }
                } else {
                    if (prevQuantity !== null) {
                        // Add "magic value" to comments array to denote empty line
                        prevQuantity.comment.push("#*$@&##");
                    }
                }

                // No matter the contents of the line, increase line number
                currentLineNum += 1;
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
            this.optimisation = false;

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

                    // Determine whether to round off input values: round if all given parameters are passed
                    // as integers, do not round if one of them is passed as floating point digit
                    if (qty.input.type == 'slider') {
                        if (isFloat(qty.input.parameters[0]) || isFloat(qty.input.parameters[1]) || isFloat(qty.input.parameters[2])) {
                            qty.input.round = false;
                        } else {
                            qty.input.round = true;
                        }
                    }
                } else if (qty.reverseDeps.length === 0 && qty.parameters.length === 0) {
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

                // Check whether this quantity has to be optimized by pareto
                if (qty.pareto.isPareto === true) {
                    this.optimisation = true;
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
                    'definition is null or undefined');
            }
            var parameters = [];
            if (type) {
                parameters = (new Function('return ' + definition))();
            }
            return parameters;
        };

        Analyser.prototype.findPareto = function(quantity) {
            if (!quantity) {
                throw new Error('Analyser.findPareto.pre violated: ' +
                    'quantity is null or undefined');
            }
            var definition = quantity.definition;
            if (definition.match(/pareto/) !== null) {
                quantity.pareto.isPareto = true;
                if (definition.match(/paretoMin\(/) !== null) {
                    quantity.pareto.isMaximize = false;
                } else if (definition.match(/paretoMax\(/) !== null) {
                    quantity.pareto.isMaximize = true;
                }
                if (definition.match(/paretoHor\(/) !== null) {
                    quantity.pareto.isHorizontal = true;
                } else if (definition.match(/paretoVer\(/) !== null) {
                    quantity.pareto.isVertical = true;
                }
            }
        };

        /**
         * Returns a string representation of the given path in a graph.
         *
         * @param {Array} path An array representing the path in the graph,
         * containing all elements in the path from the root to the leaf node.
         * @return {String} A string representation of path
         */
        Analyser.prototype.graphPathToString = function(path) {
            var ans = "";

            for (var elem in path) {
                var node = path[elem];
                ans += node + " -> ";
            }

            return ans.substr(0, ans.length-4);
        };

        // Exports all macros.
        return Analyser;
    });
