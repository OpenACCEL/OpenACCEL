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
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: "scripts"
    });
}
/*******************************************************************/

/**
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @pre min <= def <= max
 * @param  {Number} def Deafault value of the slider
 * @param  {Number} min Lower bound
 * @param  {Number} max Upper Bound
 * @return {Array}     Array with def,min,max
 */
function slider(def, min, max) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'Slider' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (isNaN(parseFloat(def)) || isNaN(parseFloat(min)) || isNaN(parseFloat(max))) {
        throw new Error('Arguments of slider must be numeric constants.');
    }

    if (min <= def && def <= max) {
        return [def, min, max];
    } else {
        throw new Error('For the slider, the default value must be between the lower and upper bound.' +
            ' Also the upper bound must be greater than the lower bound' +
            ' (Default = ' + def + ', lower = ' + min + ', upper = ' + max + ')');
    }
}

/**
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @param  {Boolean} def default value of the checkbox
 * @return {Array}     Singleton array with def
 */
function check(def) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'check' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (typeof def === 'boolean') {
        return [def];
    } else {
        throw new Error('Argument of check must be true or false');
    }
}

/**
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @param  {Number|String|Boolean} def Default value of input field
 * @return {Array}     Singleton array with def
 * @memberof Model.Library
 */
function input(def) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'input' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return [def];
}

/**
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @return {Array}     Empty array
 */
function button() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'button' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return [];
}

define(["model/analyser/passes/quantitypass",
        "model/analyser/passes/dependencypass",
        "model/quantity",
        'underscore'
    ],
    /**@lends Model.Analyser*/
    function(QuantityPass, DependencyPass, Quantity, _) {
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
                        this.findPareto(prevQuantity);
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

        // Exports all macros.
        return Analyser;
    });
