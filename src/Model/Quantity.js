/*
 * A unit of a Quantity, consisting of a numerator and optionally a denominator.
 * Both numerator and denominator can consist of zero or more terms.
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

define([], /**@lends Model.Quantity */ function() {
    /**
     * @class
     * @classdesc Represents a single quantity of the Script.
     */

    function Quantity(source) {

        /**
         * The name of the quantity as defined in the left hand side of a line.
         * In case of a function f(x), the name will be f.
         * @type {String}
         */
        this.name = '';

        /**
         * The entire 'left-hand side' of the definition of this quantity: it's name
         * with optionally it's arguments.
         *
         * @type {String}
         */
        this.LHS = '';

        /**
         * The definition of this quantity in a String format. This is simply the right
         * hand side of the equation.
         * @type {String}
         */
        this.definition = '';

        /**
         * An array containing all quantities on which this quantity is dependent.
         * Example: If the script contains a line 'a = b + c,'
         * then a, b, and c are quantities and quantity a is dependent on b and c.
         *
         * @type {String[]}
         */
        this.dependencies = [];

        /**
         * All dependencies which do not occur in the form of a history expression.
         *
         * @type {Array}
         */
        this.nonhistDeps = [];

        /**
         * The reachable quantities in the dependency graph of this quantity.
         * Contains the dependencies of this quantity, their dependencies etc.
         *
         * @type {Array}
         */
        this.reachables = [];

        /**
         * An array containing all quantities that depend on this quantity.
         * @type {String[]}
         */
        this.reverseDeps = [];

        /**
         * All reverse dependencies which do not occur in the form of a history expression.
         *
         * @type {Array}
         */
        this.reverseNonhistDeps = [];

        /**
         * The reachable quantities in the reverse dependency graph of this quantity.
         * Contains the reverse dependencies of this quantity, their reverse dependencies etc.
         *
         * @type {Array}
         */
        this.reverseReachables = [];

        /**
         * The standard library functions that appear in the definition of this quantity
         *
         * @type {Array}
         */
        this.stdfuncs = [];

        /**
         * The category of this quantity. The category is I if the quantity is variable(input
         * is given by the user), II if the quantity is an output variable, III if the
         * quantity is a constant and the category is IV if it is neither of the preceding.
         * @type {Category}
         */
        this.category = null;

        /**
         * The _provided_ unit of this quantity in a String format. If no unit is defined by
         * the user, the unit is the empty string ''. Example: If the script contains a line
         * 'a = 4 ; kg.m/s2' then the unit of quantity a is 'kg.m/s2'. This value might be different
         * from the checkedUnit attribute, as the given unit may contain errors or may be overwritten
         * by computed units during checking.
         *
         * @type {String}
         */
        this.unit = '';

        /**
         * The actual, 'correct' unit value of this quantity, as computed by the system when unit
         * checking is being performed. This can be the same as the provided unit if the provided unit
         * was correct and has not been overwritten, or can have the value 'unitError' if the given unit
         * was incorrect.
         *
         * @type {String}
         */
        this.checkedUnit = '';

        /**
         * The parameters of this quantity. If the quantity is not a function, this will be
         * the empty array []. Example: If the script contains a line 'f(x,y) = x + y'
         * then the parameters of quantity f are [x,y].
         * @type {String[]}
         */
        this.parameters = [];

        /**
         * An optional comment explaining the quantity.
         * Can span multiple lines, each entry in the array is one line
         *
         * @type {String[]}
         */
        this.comment = [];

        /**
         * Whether this quantity has an empty definition. If true, it should be displayed
         * in the todo list.
         *
         * @type {Boolean}
         */
        this.todo = true;

        /**
         * Whether this quantity is time-dependent. A quantity is time-dependent if
         * it contains a reference to a historic value of a(nother) quantity or contains
         * a function that can vary every iteration, such as random().
         *
         * @type {Boolean}
         */
        this.isTimeDependent = false;

        /**
         * The current value of the quantity, as evaluated in the executable.
         * Default value is undefined.
         *
         * @type {Number}
         */
        this.value = undefined;


        /**
         * The script line as it was originally entered by the user, or filled in by the system for
         * todo items.
         *
         * @type {String}
         */
        if (!source) {
            this.source = '';
        } else {
            this.source = source;
        }

        /**
         * This input object contains the type of the input e.g. slider, checkbox.
         * The parameters of this input are the parameters of the input method. For example,
         * in a slider the start and end limits and the default value.
         * @type {Object}
         */
        this.input = {
            type: null,
            parameters: []
        };

        /**
         * This object contains the information about the pareto quantities.
         * isPareto indicates whether this quantity is a Pareto quantity.
         * isMaximize indicates whether this quantity should be maximized, if false it should be minimized
         * isHorizontal indicates whether the quantity is plotted horizontally
         * isVertical indicates whether the quantity is plotted vertically.
         * @type {Object}
         */
        this.pareto = {
            isPareto: false,
            isMaximize: false,
            isHorizontal: false,
            isVertical: false
        };
    }

    /**
     * Marks this quantity as todo and resets all nessecary fields.
     *
     * @param {String} name (Optional) The name to give to this todo-quantity
     * @post All fields except name have been reset to their default values.
     *      source has been updated.
     */
    Quantity.prototype.markAsTodo = function(name) {
        this.name = (typeof name === 'undefined') ? this.name : name;
        this.todo = true;
        this.definition = '';
        this.LHS = '';
        this.dependencies = [];
        this.category = 0;
        this.unit = '';
        this.parameters = [];
        this.comment = [];
        this.value = 0;
        this.source = this.name + '=';
        this.isTimeDependent = false;
        this.input = {
            type: null,
            parameters: []
        };
        this.pareto = {
            isPareto: false,
            isMaximize: false,
            isHorizontal: false,
            isVertical: false
        };
    };

    /**
     * Returns the original definition code of this quantity, as it was entered by the user
     * in the UI. Includes comment.
     */
    Quantity.prototype.getSource = function() {
        var def = this.source;
        if (this.comment.length > 0) {
            var comment = '';

            for (var i = 0; i < this.comment.length; i++) {
                comment += '\n //' + this.comment[i];
            }

            def += comment;
        }

        return def;
    };

    Quantity.prototype.toSource = function() {
        return this.getSource();
    };

    /**
     * Returns a String representation of the line corresponding to this quantity
     * as provided by the user in the ACCEL script.
     *
     * @param {Object} options An object containing zero or more of the following attributes:
     * -(Boolean) includeUnits Whether to include the unit of this quantity in the output.
     * -(Boolean) includeComments Whether to include any comments belonging to this quantity in the output
     * -(Boolean) includeCheckedUnits Whether to include the unit that may have been checked, or only
     *            the one provided by the user (if any).
     * -(Boolean) includeValues Whether to include the current value, as saved in this.value, in the output
     * @return {String} The script line corresponding to this quantity, optionally with
     * unit and comment
     */
    Quantity.prototype.toString = function(options) {
        // Set default values of missing options
        if (typeof options === 'undefined') {
            options = {'includeUnits': true, 'includeComments': true, 'includeCheckedUnits': false, 'includeValues': false};
        } else {
            if (typeof options.includeUnits === 'undefined') {
                options.includeUnits = true;
            } else if (typeof options.includeComments === 'undefined') {
                options.includeComments = true;
            } else if (typeof options.includeCheckedUnits === 'undefined') {
                options.includeCheckedUnits = false;
            } else if (typeof options.includeValues === 'undefined') {
                options.includeValues = false;
            }
        }

        var def = this.LHS + '=' + this.definition;

        // Only include the unit of this quantity (if it has one) if it's a category 1 or 3 quantity
        // or when told to include checked units as well
        if (options.includeUnits) {
            if (options.includeCheckedUnits && this.checkedUnit !== '') {
                // Include the checked unit
                def += ' ; ' + this.checkedUnit;
            } else if (this.unit !== '') {
                // Include the provided unit if one was provided
                def += ' ; ' + this.unit;
            }
        }

        // Include comment(s) when asked
        if (options.includeComments && this.comment.length > 0) {
            var comment = '';

            for (var i = 0; i < this.comment.length; i++) {
                comment += '\n //' + this.comment[i];
            }

            def += comment;
        }

        // Include value when asked
        if (options.includeValues) {
            def += '\n //// Value: ' + objectToString(this.value, 500);
        }

        return def;
    };

    Quantity.prototype.getComment = function() {
        var comment = '';

        for (var i = 0; i < this.comment.length; i++) {
            comment += this.comment[i] + '\n';
        }

        return comment.slice(0,-1);
    };

    /**
     * Returns whether the Quantity is a user function.
     *
     * @return {Boolean} Whether the quantity is a user function.
     */
    Quantity.prototype.isUserFunction = function() {
        return this.parameters.length > 0
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Quantity;
});
