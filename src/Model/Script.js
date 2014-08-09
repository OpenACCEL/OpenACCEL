/*
 * The script class is a container class that contains both information about the script itself,
 * together with a report and a compiler to create the executable. This class is really a facade class
 * that links everything together concerning OpenACCEL scripts.
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

// If all requirements are loaded, we may create our 'class'.
define(["Model/Analyser/Analyser",
        "Model/Quantity",
        "underscore",
        "Model/Parser",
        "Model/Exceptions/SyntaxError",
        "Model/Exceptions/RuntimeError"],
        /** @lends Model.Script */
        function(Analyser, Quantity, _, parser, SyntaxError, RuntimeError) {
    /**
     * @class
     * @classdesc The Script class represents an ACCEL script/model, containing the defined quantities,
     * compiled executable and source code.
     *
     * @param source {String} (optional) The source code with which to initialise the script. All quantities
     * defined herein will be added to the script.
     */
    function Script(source) {
        /**
         * The analyser that will be used to analyse the script.
         *
         * @type {Analyser}
         */
        this.analyser = new Analyser();

        /**
         * The parser used to parse the quantity definitions and do syntax checking.
         */
        this.parser = parser;

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
         * Whether the script has been compiled.
         *
         * @type {Boolean}
         */
        this.compiled = false;

        /**
         * Contains the quantities that together make up the ACCEL script.
         *
         * @type {map<String, Quantity>}
         */
        this.quantities = {};

        /**
         * Array containing the names of all the quantities that have
         * been flagged as changed in the executable. Used for memoization
         * purposes when setting user input quantity values (setUserInputQuantity()).
         */
        this.flaggedAsChanged = [];

        // Initialise with given source if not undefined
        if (typeof source !== 'undefined') {
            this.addSource(source);
        }
    }


    Script.prototype = {
        /**
         * Call once every iteration during script execution.
         */
        step: function() {
            // Reset memoization datastructure for recursively flagging changed quantities
            // since last iteration. Do this here so it's done once every iteration
            this.flaggedAsChanged = [];
        },

        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        isComplete: function() {
            return this.analyser.isScriptComplete() && Object.keys(this.quantities).length > 0;
        },

        /**
         * Returns whether the script has been compiled and is thus ready to be executed.
         *
         * @return {Boolean} this.compiled
         */
        isCompiled: function() {
            return this.compiled;
        },

        /**
         * Sets the given executable as the executable of this script
         *
         * @param {Object} exe The executable to set
         */
        setExecutable: function(exe) {
            this.exe = exe;
            this.compiled = true;
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
         * Returns the quantity with the given name.
         *
         * @param {String} qtyName The name of the quantity to return.
         * @pre this.hasQuantity(qtyName)
         * @return this.quantities[qtyName]
         */
        getQuantity: function(qtyName) {
            if (!this.hasQuantity(qtyName)) {
                throw new Error('Script.prototype.getQuantity.pre :' +
                'no Quantity named qtyName');
            }

            return this.quantities[qtyName];
        },

        /**
         * Returns the value of the quantity with the given name, if the model
         * is compiled and the quantity
         *
         * @param {String} qtyName The name of the quantity of which to return the value
         * @pre this.hasQuantity(qtyName)
         * @pre this.isComplete()
         * @throws {RuntimeError} If an error occured while evaluating the quantity definition
         * @return this.quantities[qtyName]
         */
        getQuantityValue: function(qtyName) {
            if (!this.hasQuantity(qtyName)) {
                throw new Error('Script.prototype.getQuantityValue.pre :' +
                'no Quantity named qtyName');
            }
            if (!this.isComplete()) {
                throw new Error('Script.prototype.getQuantityValue.pre :' +
                'script not compiled because incomplete');
            }

            // Try evaluating the value. Throw RuntimeError if an error is thrown
            var value;
            try {
                value = this.exe.getValue(qtyName);
            } catch(e) {
                throw new RuntimeError(e.message);
            }

            return value;
        },

        /**
         * Returns the unit of the quantity with the given name, if the model
         * is compiled and the quantity exists
         *
         * @param {String} qtyName The name of the quantity of which to return the unit
         * @pre this.hasQuantity(qtyName)
         * @pre this.isCompiled()
         * @throws {RuntimeError} If an error occured while evaluating the quantity unit
         * @return this.exe.getUnit(qtyName)
         */
        getQuantityUnit: function(qtyName) {
            if (!this.hasQuantity(qtyName)) {
                throw new Error('Script.prototype.getQuantityValue.pre :' +
                'no Quantity named qtyName');
            }
            if (!this.isCompiled()) {
                throw new Error('Script.prototype.getQuantityUnit.pre :' +
                'script not compiled');
            }

            return this.exe.getUnit(qtyName);
        },

        /**
         * Adds the quantity defined in source to the script. If the quantity already exists,
         * it's definition is updated. Cannot include comments.
         *
         * @param {String} source The definition of the quantity to be added, as specified by the user
         * @modifies quantities
         * @post The quantity defined in source has been added to the script, the category of all
         * quantities has been re-evaluated and the script has been recompiled if complete.
         * @return {Quantity} The quantity that has been added to the script.
         * @throws {SyntaxError} If the given source is _not_ valid ACCEL code
         */
        addQuantity: function(source) {
            // First check whether the given piece of script is valid ACCEL code
            this.checkSyntax(source);

            // Analyse the added line of code and add the defined quantity to the model
            var qty = this.analyser.analyse(source, this.quantities)[0];
            this.scriptChanged();

            return qty;
        },

        /**
         * Adds the given piece of ACCEL script to the model. Can contain multiple
         * quantity definitions including comments. Does not delete existing quantity
         * definitions!
         *
         * @param {String} source The piece of ACCEL script to add to the model.
         * @modifies quantities
         * @post All quantities defined in source have been added to the model,
         * including any comments.
         * @return {Quantity[]} An array of quantities that were added to the script.
         * @throws {SyntaxError} If the given source is _not_ valid ACCEL code
         */
        addSource: function(source) {
            // First check whether the given piece of script is valid ACCEL code
            this.checkSyntax(source);

            // Analyse the added line of code and add the defined quantity to the model
            var added = this.analyser.analyse(source, this.quantities);
            this.scriptChanged();

            return added;
        },

        /**
         * Returns whether the given piece of script is valid ACCEL code.
         *
         * @param {String} source The piece of script of which to check the syntax
         * @return Whether source is valid ACCEL code
         * @throws {SyntaxError} If the given source is _not_ valid ACCEL code
         */
        checkSyntax: function(source) {
            try {
                this.parser.parse(source);
            } catch (e) {
                // A syntax error occured in the Jison parser. This could either be a parser or
                // lexical error. In the latter case, only the properties e.hash.line and
                // e.message are defined!
                var err = new SyntaxError();

                if (typeof e.hash.loc === 'undefined') {
                    // Lexical error
                    err.type = "lexical";
                    err.message = e.message;
                    err.firstLine = err.lastLine = e.hash.line+1;

                    // Deduce the position from the amount of '-' characters in the error message
                    // and the start of the string mentioned in the message..
                    var textMatch = err.message.split("\n")[1];
                    var offset = source.indexOf(textMatch);

                    var relativePosRE = /(-)*\^$/;
                    var position = relativePosRE.exec(err.message)[0].length;


                    err.startPos = offset+position-1;
                    err.endPos = offset+position-1;
                    err.found = source.substr(err.startPos, 1);
                } else {
                    // Parsing error
                    err.type = "parsing";
                    err.found = e.hash.text;
                    err.expected = e.hash.expected;
                    err.firstLine = e.hash.loc.first_line;
                    err.lastLine = e.hash.loc.last_line;
                    err.startPos = e.hash.loc.first_column;
                    err.endPos = e.hash.loc.last_column;
                    err.message = e.message;
                }

                throw err;
            }

            return true;
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
                'quantity does not exist');
            }
            if (this.quantities[qtyName].todo) {
                throw new Error('Script.prototype.deleteQuantity.pre :' +
                'quantity cannot be deleted: is a todo item');
            }

            var delqty = this.quantities[qtyName];

            // Step 1: Delete all dependencies of this quantity that are marked as todo and have no other reverse dependencies
            // Also, remove this quantity from all reverse dependency lists
            delqty.dependencies.forEach((function(d) {
                var dep = this.quantities[d];
                if (dep.todo) {
                    if (_.size(dep.reverseDeps) <= 1) {
                        // We are the only quantity depending on it, so delete it
                        delete this.quantities[d];
                    } else {
                        // Remove us from reverse-dependency array
                        this.quantities[d].reverseDeps = _.without(this.quantities[d].reverseDeps, qtyName);
                    }
                } else {
                    // Remove us from reverse-dependency array
                    this.quantities[d].reverseDeps = _.without(this.quantities[d].reverseDeps, qtyName);
                }
            }).bind(this));

            // Step 2: Mark this quantity as todo or remove it from the script entirely
            // depending on whether it has any reverse dependencies
            if (_.size(delqty.reverseDeps) > 0) {
                this.quantities[qtyName].markAsTodo();
            } else {
                delete this.quantities[qtyName];
            }

            this.scriptChanged();
        },

        /**
         * Returns an object containing all category 2 quantities, keyed
         * by quantity name, and containing their current values if the script
         * can be executed. Output values are all "?" if model is incomplete.
         *
         * @throws {RuntimeError} If an error occured while evaluating the
         * output quantities
         * @return this.analyser.getOutputQuantities()
         */
        getOutputQuantities: function() {
            var cat2quantities = this.analyser.getQuantitiesByCategory(2);
            var q;

            // Populate object with quantity values if script has been compiled
            if (this.isCompiled()) {
                for (q in cat2quantities) {
                    cat2quantities[q].value = this.getQuantityValue(q);
                }
            } else {
                // Else set output values to "?"
                for (q in cat2quantities) {
                    cat2quantities[q].value = "?";
                }
            }

            return cat2quantities;
        },

        /**
         * Checks the unit of all quantities in the script and stores the results in the Quantity objects
         *
         * @pre this.isCompiled()
         */
        checkUnits: function() {
            if (this.isCompiled()) {
                // First just check all units, skipping over errors
                for (var qtyName in this.quantities) {
                    var unit = this.getQuantityUnit(qtyName);
                    this.quantities[qtyName].checkedUnit = unit;

                    // Also overwrite given unit if the unit is correct
                    if (unit !== 'unitError' && unit !== 'uncheckedUnit') {
                        this.quantities[qtyName].unit = unit;
                    }
                }

                // Now that we checked all units, check whether any errors occured and if so
                // throw them
                var errors = this.exe.getUnitErrors();
                if (errors !== false) {
                    throw new RuntimeError(errors);
                }
            }
        },

        /**
         * Returns an object containing all quantities of the given
         * category. For category 2, output quantities, also retrieves their
         * current values from the executable if the script has been compiled.
         *
         * @param {Integer} cat The category of which to return all quantities
         * @return {map<String, Quantity>} Object containing all quantities in
         * category cat.
         */
        getQuantitiesByCategory: function(cat) {
            if (cat === 2) {
                return this.getOutputQuantities();
            } else {
                return this.analyser.getQuantitiesByCategory(cat);
            }
        },

        /**
         * Sets the value of a category 1 user input quantity.
         *
         * @param {String} qtyName The name of the category 1 quantity to set the value of
         * @param {Number} value The value to give to the Quantity with name qtyName
         * @pre this.hasQuantity(qtyName) && this.quantities[qtyName].category == 1
         * @post this.quantities[qtyName].value == value
         */
        setConstant: function(qtyName, value) {
            if(this.getQuantity(qtyName).category != 1) {
                throw new Error('Script.prototype.setConstant.pre :' +
                'not a category 1 (user-input) quantity');
            }

            // Update value in quantities array
            this.quantities[qtyName].value = value;

            // Only update values if script has been compiled!
            if (this.isCompiled()) {
                this.exe.setValue(qtyName, value);

                // Recursively flag the updated user input quantity and all it's reverse
                // dependencies as changed
                this.setQuantityChanged(this.quantities[qtyName], true);

                // Because of the fact that a cat 1 expression evaluates to 'null' in Jison,
                // we'll have to set hasChanged back to false, as the controller already updates the expression.
                // There is no need to re-evaulate the expression for this cat 1 input.
                // If we evaluate it, it gets set to null which is not what we want.
                this.exe.setHasChanged(qtyName, false);
            }
        },

        /**
         * Recursively sets whether the given quantity and all of it's reverse
         * dependencies have been modified.
         *
         * @pre this.isCompiled() == true
         * @param {Quantity} quantity The quantity to use as starting point. All of it's reverse dependencies, if any, are set recursively.
         * @param {Boolean} changed Whether to mark quantity and it's reverse dependencies as changed or not.
         */
        setQuantityChanged: function(quantity, changed) {
            // Base case: quantity already checked
            if (this.flaggedAsChanged.indexOf(quantity.name) >= 0) {
                return;
            }

            if (!this.exe.exists(quantity.name)) {
                return;
            }

            this.exe.setHasChanged(quantity.name, true);
            this.flaggedAsChanged.push(quantity.name);
            for (var dep in quantity.reverseDeps) {
                this.setQuantityChanged(this.quantities[quantity.reverseDeps[dep]], true);
            }
        },

        /**
         * Does all things that should be done when the script has changed:
         * - Re-evaluates the category of all quantities
         * - Updates various state variables
         *
         * Call this method when this.quantities has been modified.
         *
         * @modifies this.quantities
         * @post The categories of all quantities have been determined and set
         * and the state has been updated
         */
        scriptChanged: function() {
            this.scriptModified = true;
            this.compiled = false;
            this.exe = null;

            // Determine categories of all quantities
            this.analyser.determineCategories(this.quantities);
        },

        /**
         * Returns the plot array from the executable.
         * Returns the empty array if the executable is null
         *
         * @return {Array} plot array
         */
        getPlot: function() {
            if (!this.exe) {
                return [];
            } else {
                return this.exe.plot;
            }
        },

        /**
         * Returns the code of the script as a single string, exactly as it was entered by the user.
         *
         * @return {String} A single line containing all quantity definitions in the script, exactly
         * as they were entered by the user
         */
        getSource: function() {
            // Use cached value if script has not been modified since last call to this function
            // if (!this.scriptModified) {
            //     return this.source;
            // }

            // Iterate through all quantities and append their definition to the source code
            var lines = [];
            for (var qtyName in this.quantities) {
                var qty = this.quantities[qtyName];

                // Do not include quantities in the script string that are undefined!
                if (!qty.todo) {
                    lines.push(qty.getSource());
                }
            }

            this.source = lines.join("\n");
            this.scriptModified = false;

            return this.source;
        },

        /**
         * Replaced with getSource()!
         */
        toSource: function() {
            console.log("Warning: using old function Script.toSource(), " +
                "use Script.getSource() or Script.toString() instead!");

            return this.getSource();
        },

        /**
         * Returns the code of the script as a single string.
         *
         * @pre this.isCompiled() || !(options.includeValues)
         * @param {Object} options An object containing zero or more of the following attributes:
         * -(Boolean) includeUnits Whether to include the quantity units in the output.
         * -(Boolean) includeComments Whether to include the comments belonging to the quantities in the output
         * -(Boolean) includeCheckedUnits Whether to include the units that may have been checked, or only
         *            those provided by the user.
         * -(Boolean) includeValues Whether to include the current values of the quantities in the output
         *
         * @return {String} A single line containing all quantity definitions in the script.
         */
        toString: function(options) {
            if (options.includeValues && !this.isCompiled()) {
                throw new Error("Script.toString.pre violated: trying to include values in source while script is not compiled.");
            }

            // Iterate through all quantities and append their string representation to the source code
            var lines = [];
            for (var qtyName in this.quantities) {
                var qty = this.quantities[qtyName];

                // Do not include quantities in the script string that are undefined!
                if (!qty.todo) {
                    // Compute and include the values in the output if specified
                    if (options.includeValues || options.includeCheckedUnits) {
                        // Compute the value and save it in the quantity. Then call
                        // toString of the quantity so it can use the computed value.
                        qty.value = this.getQuantityValue(qtyName);
                    }

                    lines.push(qty.toString(options));
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
