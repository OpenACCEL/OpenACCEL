/*
 * The executable class will contain all functions neccessary in order to execute a compiled script.
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

define(["Model/Exceptions/RuntimeError", "Model/Exceptions/UnitError", "Model/DebugMessage"], /**@lends Model*/ function(RuntimeError, UnitError, DebugMessage) {

    /**
     * @class
     * @clasdesc The Executable represents an ACCEL script at run-time.
     * It has functions to query and update the current values of quantities,
     * and functions to progress time.
     * Apart from the functions defined in the prototype,
     * an instance of Executable has a function to query each of the
     * quantities. These functions are generated by the code passed to the
     * constructor.
     *
     * @param {String} code   Code to eval when initializing the Executable
     *                        This code should generate the functions for the quantities.
     * @param {Object} report Set of Quantity objects containing all quantities in the script
     */
    function Executable(code, report) {
        // Evaluate the given code. This adds all methods for evaluating all quantities in the
        // script to the Executable object.
        eval(code);

        /**
         * Map of all quantities in the script, with their
         * names surrounded by double underscores as keys and
         * the corresponding Quantity objects as values.
         *
         * Their names are surrounded by underscores because this is how
         * the quantities are addressed in the code generated by the parser
         * and macro expander. This is done in order to be able to distinguish
         * between user defined quantities and built-in functions and things
         * like Javascript keywords.
         *
         * @type {Object}
         */
        this.report = this.underscorifyKeys(report);

        /**
         * X-coordinate of the mouse inside the graphics canvas
         * @type {Number}
         */
        this.mouseX = 0;

        /**
         * Y-coordinate of the mouse inside the graphics canvas
         * @type {Number}
         */
        this.mouseY = 0;

        /**
         * Whether the left mouse button is currently pressed
         * @type {Boolean}
         */
        this.mouseButtonPressed = false;

        /**
         * Graphics plot object, set by the library function plot()
         * @type {Array}
         */
        this.plot = [];

        /**
         * Whether the executable contains a plot function that is
         * being called.
         *
         * @type {Boolean}
         */
        this.hasPlot = false;

        /**
         * Graphics plot object, set by the library function plot()
         * @type {Array}
         */
        this.plotStatus = '';

        /**
         * Dictionary of libraries containing functions that must be accessible
         * to the code inside quantity expressions. Multiple libraries can be loaded,
         * each accessible by their own key.
         *
         * @type {Object}
         */
        this.lib = {};

        /**
         * Whether the executable has been compiled with unit support or not.
         *
         * @type {Boolean}
         */
        this.units = false;

        /**
         * An array of errors that occured during unit checking.
         * Errors that occur during checking are stored in this array but the checking
         * will continue instead of aborting.
         *
         * @type {Array<UnitError>}
         */
        this.unitErrors = [];
    }

    /**
     * Function that gets called when invoking exe.__qty__(), where qty is the quantity whose value you want.
     *
     * @param {Object} The quantity in the executable whose expression you want to evaluate. Usually, this is 'this.qty'.
     * @param {Report} The report concerning the given quantity. This will usually be 'this.report.qty'.
     */
    Executable.prototype.expr = function(quantity, report) {
        /**
         * If a quantity is time dependant and is not an input quantity, check if it already has been evaluated and if yes
         * return the evaluated value. Else evaluate it now. This is a form of memoization/caching.
         * Input quantities are time dependent but do not have an executable library function: their
         * value is set by the controller when the corresponding input element is changed by the user in the UI.
         */
        var history = quantity.hist;

        if (report.isTimeDependent) {
            // If the current time-step value has not been evaluated yet, do it now.
            if (history[0] === undefined) {
                // For non-input quantities, evaluate the expression of this quantity and store it
                // in the history datastructure
                if (report.category !== 1) {
                    // Check for cyclic dependencies. Only non-input quantities can cause cyclic dependencies.
                    // If this quantity has been touched before it means that the system
                    // is still evaluating it's expression and there is a cyclic dependency
                    if (quantity.touched === true) {
                        throw new RuntimeError("Cyclic dependency detected for quantity " + report.name);
                    }
                    quantity.touched = true;

                    history[0] = quantity.expr();
                } else {
                    // For input quantities, which do not have executable library functions,
                    // retrieve the current value from the report and store it in the history

                    // Don't forget to check for units. If we're evaluating units, we must cast the
                    // answer as a UnitObject. If the report value is undefined, we just fetch
                    // it from the default input value.
                    var value = (report.value) ? report.value : report.input.parameters[0];
                    if (this.units) {
                        history[0] = new UnitObject(value, quantity.unit);
                    } else {
                        history[0] = value;
                    }
                }
            }
        } else {
            // Quantity value does not change with time: check if it has been evaluated already
            // and hasn't changed (applicable to user input). Else evaluate it now and store result
            if (history[0] === undefined || quantity.hasChanged) {
                // Check for cyclic dependencies: if this quantity has been touched before it means that the system
                // is still evaluating it's expression and there is a cyclic dependency
                if (quantity.touched === true) {
                    throw new RuntimeError("Cyclic dependency detected for quantity " + report.name);
                }

                quantity.touched = true;
                history[0] = quantity.expr();
                quantity.hasChanged = false;
            }
        }



        return history[0];
    };

    /**
     * When dealing with units, this function will give a given *scalar* answer the unit of the quantity
     * for which it belongs, if that quantity is of category 1 or 3. Otherwise, the quantity's unit has just
     * been calculated and resides in the answer. The quantity will then take over that quantity.
     *
     * @param {Object} The quantity in the executable whose expression you want to evaluate. Usually, this is 'this.qty'.
     * @param {Report} The report concerning the given quantity. This will usually be 'this.report.qty'.
     * @param The answer, or value of the quantity as been calculated by its expression.
     */
    Executable.prototype.unitexpr = function(quantity, report, ans) {
        var category = report.category;

        /**
         * If the quantity has category 1 or 3, and a unit, this unit should be the unit
         * of the final expression answer. Otherwise, the unit of the final expressions should
         * 'overwrite' the unit of the quantity.
         */
        if (quantity.unit && (category === 1 || category === 3 ||
            (report.dependencies.length === 0 && report.reverseDeps.length === 0))) {
             /**
             * Perform an automapping over the answer.
             * This will turn each scalar element into a UnitObject with the unit
             * as determined by the user.
             *
             * Also check whether the signature of the unit matches that of it's value.
             */
            if (Object.keys(quantity.unit).length === 0 || UnitObject.prototype.verifySignature(ans, quantity.unit)) {
                ans = UnitObject.prototype.create(ans, quantity.unit);
            } else {
                ans = UnitObject.prototype.makeError(ans, "unitError", "Signature of quantity " + report.name + " is incorrect");
            }
        } else {
            // This value is guaranteed to have some unit. The quantity will take this unit.
            // (It is an intermediate or output quantity, category 2 or 4).
            quantity.unit = unaryZip(ans, function(x) {
                return x.unit;
            });
        }

        // Store any textual description of errors that might have occured during the checking of
        // this unit in the Executable so they can be retrieved later (after all units have been checked).
        var err = this.findFirstError(ans);
        if (err !== '') {
            // Signal error to debug log
            var msg = new DebugMessage("Unit error: " + report.name + ": " + err, "ERROR_SYNTAX");
            msg.uniterror = true;
            $(document).trigger("DEBUGLOG_POST_MESSAGE", [msg]);
            this.unitErrors.push(new UnitError(report.name, err));
        }

        return ans;
    };

    /**
     * Tries to execute a quantity with memoization.
     *
     * @param  {Quantity} quantity The quantity to execute.
     * @param  {Object} args      The arguments of the quantity, in case it is a function call.
     */
    Executable.prototype.memoization = function(quantity, args) {
        // Support memoization only for 'primitive types', not objects
        var slicedArgs = Array.prototype.slice.call(args);
        var obj = false;
        for (var i=slicedArgs.length; i>=0; i--) {
            if (slicedArgs[i] instanceof Object) {
                obj = true;
                break;
            }
        }

        if (!obj) {
            hash = JSON.stringify(slicedArgs);
            return (hash in quantity.cache) ? quantity.cache[hash] : quantity.cache[hash] = quantity.expr.apply(this, args);
        } else {
            return quantity.expr.apply(this, args);
        }
    };

    /**
     * Recursively traverses the (array of array of ...) UnitObject(s) and
     * returns the first error it finds.
     *
     * @param  {UnitObject} obj (array of array of ...) UnitObject(s)
     * @return {String} The first error found
     */
    Executable.prototype.findFirstError = function(obj) {
        if (obj instanceof Array) {
            var err;
            for (var obj2 in obj) {
                err = this.findFirstError(obj[obj2]);
                if (err !== '') {
                    return err;
                }
            }

            // If no errors were found, return ''
            return '';
        } else {
            return obj.errorString;
        }
    };

    /**
     * Puts two underscores before and after each key of the given object.
     * This is done in order to be able to distinguish
     * between user defined quantities and built-in functions and things
     * like Javascript keywords.
     *
     * @param  {Object} obj object to convert
     * @return {Object}     converted object.
     */
    Executable.prototype.underscorifyKeys = function(obj) {
        var obj2 = {};
        for (var key in obj) {
            obj2['__' + key + '__'] = obj[key];
        }
        return obj2;
    };

    /**
     * Progresses time one step in the executable.
     *
     * Executes the functions belonging to each time-depenent quantity.
     */
    Executable.prototype.step = function() {
        if (this.report) {
            for (var qty in this.report) {
                // Evaluate all quantities that aren't functions. This also
                // ensures that all quantities will have been evaluated even if they weren't required
                // for the computation of any output quantities in this iteration. This prevents missing
                // values in the history arrays of quantities.
                if ((this.report[qty].isTimeDependent || this[qty].hasChanged) && this.report[qty].parameters.length === 0) {
                    this[qty]();
                }

                // Update the history if the quantity has one
                if(this[qty].hist) {
                    this.historyStep(qty);
                } else { // No history means we're dealing with a user-defined function with cache
                    // Clear memoization cache of user functions
                    /*for (var c in this[qty].cache) {
                        delete this[qty].cache[c];
                    }*/

                    this[qty].cache = {};
                }

                // Reset touched flags
                this[qty].touched = false;
                this[qty].historyTouched = false;
            }
        }
    };

    /**
     * Progress the history one step in the executable.
     *
     * @param qty The quantity whose history to advance with one step.
     * @pre qty.hist !== undefined && qty.hist.length > 0
     */
    Executable.prototype.historyStep = function(qty) {
        // All history values have been set, and we need to shift the histories.
        this[qty].hist.unshift(undefined);

        // + 1, because the hist array also contains the present value (t{0}),
        // and therefore the array has one element more than the timespan number gives.
        if (this[qty].hist.length - 1 > this[qty].timespan) {
            this[qty].hist.length -= 1;
        }

        // Reset buttons after one iteration.
        // A button stays on true when pressed, but it should only be true for one iteration.
        if (this.report[qty].input.type === 'button') {
            this.report[qty].value = false;
            this[qty].hist[0] = false;
        }
    };

    /**
     * Resets the executable.
     *
     * Clears the history of every quantity, resets the time,
     * and restores internal varibles to their default values.
     */
    Executable.prototype.reset = function() {
        for (var qty in this.report) {
            if (this[qty].hist) {
                this[qty].hist.length = 0;
                this[qty].timespan = 0;
                this[qty].historyTouched = false;
            }

            // Always set touched to false, regardless of whether the quantity has a history or not!
            this[qty].touched = false;
        }

        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseButtonPressed = false;
        this.plot = [];
        this.plotStatus = '';

        // Do not reset hasPlot
    };

    /**
     * Sets the mouse X and Y coordinates tot he given coordinates
     * @param {Number} x X-coordinate
     * @param {Number} y Y-coordinate
     */
    Executable.prototype.setMousePos = function(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    };

    /**
     * Gets the current execution-time value of the given quantity.
     * @param  {String} quantity name of the quantity
     * @pre             quantity exists in the current executable
     * @return          Current value of the quantity
     */
    Executable.prototype.getValue = function(quantity) {
        var localQty = '__' + quantity + '__';

        // User defined functions can't have a unit without knowing its arguments.
        if (this.report[localQty].parameters.length > 0) {
            return "";
        }

        if (this[localQty]) {
            return this[localQty]();
        } else {
            throw new Error('Executable.prototype.getValue.pre violated :' +
                'no Quantity named ' + quantity);
        }
    };

    /**
     * Gets the unit of the given quantity.
     *
     * @param  {String} quantity name of the quantity
     * @pre             quantity exists in the current executable
     * @return          Unit of the quantity
     */
    Executable.prototype.getUnit = function(quantity) {
        var localQty = '__' + quantity + '__';
        if (this[localQty]) {
            // User defined functions can't have a unit without knowing its arguments.
            if (this.report[localQty].parameters.length > 0) {
                return "";
            }

            var unit;
            try {
                unit = this[localQty]();
            } catch (e) {
                throw new RuntimeError("Error evaluating unit of quantity " + quantity + ": " + e.message);
            }

            return this.serialiseUnit(unit);
        } else {
            throw new Error('Executable.prototype.getUnit.pre violated :' +
                'no Quantity named ' + quantity);
        }
    };

    /**
     * Returns all errors that occured during unit checking in an array with as keys the quantity name
     * and as values the errors that occured
     */
    Executable.prototype.getUnitErrors = function() {
        return this.unitErrors;
    };

    /**
     * Serialises the given unit, or array of units, to string format.
     *
     * @param  {UnitObject} unit (Array of) UnitObject(s) to serialise
     * @return {String} The string representation of the given units.
     */
    Executable.prototype.serialiseUnit = function(unit) {
        // Handle both arrays of units and single UnitObjects
        if (unit instanceof Array) {
            var ans = '[';
            for (var elem in unit) {
                // Key can be either a named key or integer
                if (parseInt(elem) == elem) {
                    // Unnamed element
                    ans += this.serialiseUnit(unit[elem]);
                } else {
                    ans += elem.toString() + ":" + this.serialiseUnit(unit[elem]);
                }
                ans += ", ";
            }

            // Remove last comma from array contents
            ans = ans.substring(0, ans.length-2);
            ans += "]";

            return ans;
        } else {
            return unit.unitToString();
        }
    };

    /**
     * Sets the current execution-time value of the given quantity.
     * @param {String} quantity Name of the quantity
     * @param          value    Value the quantity should get.
     *
     * @pre quantity exists in the current executable
     * @pre quantity is not a user-defined function
     */
    Executable.prototype.setValue = function(quantity, value) {
        var localQty = '__' + quantity + '__';

        if (!(this[localQty])) {
            throw new Error('Executable.prototype.setValue.pre violated :' +
                'no Quantity named ' + quantity);
        }
        if (!this[localQty].hist) {
            throw new Error('Executable.prototype.setValue.pre violated : ' +
                quantity + ' is a user-defined function');
        }

        // Convert the value to a UnitObject if the executable has been compiled with unit support.
        if (this.units && !(value instanceof UnitObject)) {
            value = new UnitObject(value);
        }

        this[localQty].hist[0] = value;
        this.report[localQty].value = value;
    };


    /**
     * Sets whether the given quantity value has changed since the previous
     * execution iteration
     *
     * @param {String}  quantity   Quantity name
     * @param {Boolean} hasChanged whether the quantity has changed.
     */
    Executable.prototype.setHasChanged = function(quantity, hasChanged) {
        var localQty = '__' + quantity + '__';

        if (!(this[localQty])) {
            throw new Error('Executable.prototype.setHasChanged.pre violated :' +
                'no Quantity named ' + quantity);
        }

        this[localQty].hasChanged = hasChanged;
    };

    /**
     * Returns whether the given quantity exists.
     * @param  {String} quantity name of the quantity
     * @pre             quantity exists in the current executable
     * @return          Returns whether the given quantity exists.
     */
    Executable.prototype.exists = function(quantity) {
        var localQty = '__' + quantity + '__';

        // Convert to Boolean value with double '!!'
        return !!this[localQty];
    };

    /**
     * Sets whether the mouse button is pressed
     * @param {Boolean} buttonDown whether the mouse button is pressed
     */
    Executable.prototype.setMouseButton = function(buttonDown) {
        this.mouseButtonPressed = buttonDown;
    };

    /**
     * Sets report of the plot function
     * @param {String} status any errors that have occurred while plotting
     */
    Executable.prototype.setPlotStatus = function(status) {
        this.plotStatus = status;
    };

    /**
     * Executes the quantities given in the outputs array, after filling in the values given in the
     * inputs array. The values are immediately filled in in the output objects.
     * The values are restored afterwards.
     *
     * Needed for Genetic Optimisation.
     *
     * @param {Array}   inputs  array containing object having a 'name' and 'value' field with the with the quantities that
     *                          should get a value.
     * @param {Array}   outputs array containing objects that have at leat a 'name' and 'value' field with the output quantities
     *
     * @param {Number}  steps   the number of iterations before executing the quantities
     */
    Executable.prototype.executeQuantities = function(inputs, outputs, steps) {
        this.reset();
        var key;
        var elem;

        // set the values to the ones given in input
        for (key in inputs) {
            elem = inputs[key];
            this.setValue(elem.name, elem.value);
        }

        // do as many steps as needed
        for (var i = steps - 1; i >= 0; i--) {
            this.step();
        }

        // update the values in the output-objects
        for (key in outputs) {
            elem = outputs[key];
            this.setHasChanged(elem.name, true);
        }
        for (key in outputs) {
            elem = outputs[key];
            elem.value = this.getValue(elem.name);
        }

        this.reset();
    };

    /**
     * Used in sensitivity analysis. Executes the quantities given in the outputs argument after setting the quantities
     * given in the inputs argument to the given values. Resets the executable afterwards.
     *
     * @param {Object} q13 Object having a 'name' and 'value' field containing the name and value of the quantity
     * to set before executing the output quantities
     * @param {Dictionary} outputs Dictionary with as keys the names of the quantities to execute. The values will be set
     * by this function.
     */
    Executable.prototype.executeQuantitySensitivity = function(q13, outputs) {
        // Set value of given category 1 or 3 quantity
        origValue = this.getValue(q13.name);
        this.setValue(q13.name, q13.value);

        // Flag all category 2 and 4 quantities to be recomputed
        for (key in this.report) {
            elem = this.report[key];

            if (elem.category === 1 || elem.category === 3) {
                this[key].hasChanged = false;
            } else {
                this[key].hasChanged = true;
                if (this[key].hist) {
                    this[key].hist.length = 0;
                }
            }

            this[key].touched = false;
        }

        // Compute all given output quantities and fill in their values in the given
        // dictionary
        for (key in outputs) {
            outputs[key] = parseFloat(this.getValue(key));
        }

        // Reset executable to original state
        this.reset();
        this.setValue(q13.name, origValue);
    };

    return Executable;
});
