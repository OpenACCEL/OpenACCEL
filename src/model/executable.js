/*
 * @author Roel Jacobs
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

define(["model/exceptions/RuntimeError"], /**@lends Model*/ function(RuntimeError) {

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
         * An array of descriptions of errors that occured during unit checking.
         * Errors that occur during checking are stored in this array but the checking
         * will continue instead of aborting.
         *
         * @type {Array}
         */
        this.unitErrors = [];
    }


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
                // Evaluate all quantities that are time dependent and that aren't functions
                if (this.report[qty].isTimeDependent && this.report[qty].parameters.length === 0) {
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
        this[qty].hist.unshift(undefined)

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
    }

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
            }
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
        if (this[localQty]) {
            return this[localQty]();
        } else {
            throw new Error('Executable.prototype.getValue.pre violated :' +
                'no Quantity named ' + quantity);
        }
    };

    /**
     * Sets whether the executable should execute the standard or unit expresison for all quantities.
     * @param {Boolean} bUnits Whether the unit expression should be evaluated for all quantities.
     */
    Executable.prototype.setUnits = function(bUnits) {
        for (var qty in this.report) {
            if (bUnits) {
                this[qty].expr = this[qty].unitexpr;
            } else {
                this[qty].expr = this[qty].stdexpr;
            }
        }

        // Clear unit errors that may have been left over from previous checks
        if (bUnits) {
            this.unitErrors = [];
        }
    }

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
     * Returns all errors that occured during unit checking as a single string.
     * @return {String} A string containing all errors that occured during unit checking, or false
     * when no errors occured.
     */
    Executable.prototype.getUnitErrors = function() {
        if (this.unitErrors.length === 0) {
            return false;
        }

        var ans = 'The following errors occured during unit checking: \n\n';

        for (var err in this.unitErrors) {
            ans += this.unitErrors[err] + "\n"
        }

        return ans;
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
                    ans += elem.toString() + ": " + this.serialiseUnit(unit[elem]);
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

        return this[localQty].hasChanged = hasChanged;
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

        // set the values to the ones given in input
        for (var key in inputs) {
            var elem = inputs[key];
            this.setValue(elem.name, elem.value);
        }

        // do as many steps as needed
        for (var i = steps - 1; i >= 0; i--) {
            this.step();
        }

        // update the values in the output-objects
        for (var key in outputs) {
            var elem = outputs[key];
            this.setHasChanged(elem.name, true);
            elem.value = this.getValue(elem.name);
        }

        this.reset();
    };

    return Executable;
});
