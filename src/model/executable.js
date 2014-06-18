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

define([], /**@lends Model*/ function() {

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
         * Current time-step of the runtime execution
         * @type {Number}
         */
        this.time = 0;

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
                if (this.report[qty].isTimeDependent && this.report[qty].parameters.length === 0) {
                    this[qty]();
                }

                // Store values of input quantities in their history manually each
                // iteration
                if (this.report[qty].category == 1) {
                    this[qty].hist[this.time] = this.report[qty].value;
                }

                // Reset button input values to false after one iteration
                if (this.report[qty].input.type == 'button') {
                    this[qty].hist[0] = false;
                }
            }
        }

        // Increase current timestep
        this.time++;
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
            }
        }

        this.time = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseButtonPressed = false;
        this.plot = [];
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

        return this[localQty].hist[0] = value;
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
     * Executes the quantities given in the outputs array, after filling in the values given in the
     * inputs array. The values are immediately filled in in the output objects.
     * The values are restored afterwards.
     *
     * Needed for SPEA.
     *
     * @param  {Array} inputs  array containing object having a 'name' and 'value' field with the with the quantities that
     *                         should get a value.
     * @param  {Array} outputs array containing objects that have at leat a 'name' and 'value' field with the output quantities
     *
     */
    Executable.prototype.executeQuantities = function(inputs, outputs) {
        var memory = [];

        // Remember the current values of inputs, and set the values to the ones given in input
        inputs.forEach((function(elem) {
            memory.push({
                name: elem.name,
                value: this.getValue(elem.name)
            });
            this.setValue(elem.name, elem.value);
        }).bind(this));

        // update the values in the output-objects
        outputs.forEach((function(elem) {
            elem.value = this.getValue(elem.name);
        }).bind(this));

        // undo changes
        memory.forEach((function(elem) {
            this.setValue(elem.name, elem.value);
        }).bind(this));
    };

    return Executable;
});
