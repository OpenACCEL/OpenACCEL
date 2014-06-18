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
define([], function() {
    /**
     * @class AbstractFunctionPropagator
     * @classdesc The AbstractFunctionPropagator class provides DescartesHandlers to Canvases,
     * allowing them to correctly draw any supported model element.
     */
    function AbstractFunctionPropagator() {
        /**
         * The DescartesHandlers that can be provided by this class.
         *
         * @type {array<AbstractDescartesHandler>}
         */
        this.propagatables = [];
    }


    AbstractFunctionPropagator.prototype = {

        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
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
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
         */
        getFunctions: function() {
            var allFuncs = this.propagatables;
            allFuncs = allFuncs.concat(this.getSubfunctions());
            return allFuncs;
        },

        /**
         * Returns whether the script can be compiled and executed.
         *
         * @return this.analyser.scriptComplete && this.quantities.length > 0
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
