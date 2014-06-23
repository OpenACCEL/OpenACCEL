/*
 *
 * @author Leo van Gansewinkel
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
define([], /* @lends View.Graphics */ function() {
    /**
     * @class AbstractFunctionPropagator
     * @classdesc The AbstractFunctionPropagator provides basic functionality for extended classes to
     * propagate their functions to other AbstractFunctionPropagators, which can then use them as their own.
     */
    function AbstractFunctionPropagator() {
        /**
         * The functions and their names to be propagated for facade creation.
         *
         * @type {array<Object<String, function>>}
         */
        this.propagatables = [];
    }


    AbstractFunctionPropagator.prototype = {

        /**
         * Returns the propagatables of all AbstractFunctionPropagators this propagator has, recursively.
         *
         * @return allFuncs {array<Object<String, function>>}
         * [ f | Exists_i,j[this[i] instance of AbstractFunctionPropagator : this[i].getFunctions()[j] == f]]
         */
        getSubfunctions: function() {
            var allFuncs = [];
            for (key in this) {
                if (this[key] instanceof AbstractFunctionPropagator) {
                    allFuncs = allFuncs.concat(this[key].getFunctions());
                }
            }
            return allFuncs;
        },

        /**
         * Returns the propagatables of all AbstractFunctionPropagators this propagator has, recursively.
         *
         * @return allFuncs {array<Object<String, function>>}
         * [ f | Exists_i,j[(this[i] instance of AbstractFunctionPropagator => this[i].getFunctions()[j] == f]) ||
         * f in this.propagatables]
         */
        getFunctions: function() {
            var allFuncs = this.propagatables;
            allFuncs = allFuncs.concat(this.getSubfunctions());
            return allFuncs;
        },

        /**
         * Makes all functions returned by this.getSubfunctions() accessible in this object under the enclosed name.
         *
         * @modiefies this {AbstractFunctionPropagator} Functions from this.getSubfunctions() are added to this.
         * @post ForAll_i[ i in getSubfunctions() : this[getSubfunctions()[i].name] == getSubfunctions()[i].func]
         */
        facadify: function() {
            var allFuncs = this.getSubfunctions();
            var name;
            var func;
            for (key in allFuncs) {
                name = allFuncs[key].name;
                func = allFuncs[key].func;
                eval("this." + name + " = func");
            }
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AbstractFunctionPropagator;
});
