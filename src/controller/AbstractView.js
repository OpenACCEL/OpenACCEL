/**
 *
 * @author Edward Brinkmann
 */

/** Browser vs. Node ***********************************************/
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
define([], /**@lends Controller*/ function() {
    /**
     * @class
     * @classdesc Interface declaring the methods that the view with which the Controller will
     * communicate should implement.
     */
    function AbstractView() {}

    AbstractView.prototype = {
        /**
         * Should use the given map of quantities to update the UI lists.
         * NOTE: do NOT retrieve the values from these quantities for
         * presenting the results!
         *
         * @param quantities {map<String, Quantity>} All the quantities
         * currently in the model, including todo quantities with empty
         * definitions.
         * @abstract
         */
        setQuantities: function(quantities) {},

        /**
         * Should display the values of the given output quantities in the UI.
         *
         * @param cat2quantities {map<String, Quantity>} A map of all output
         * quantities in the script.
         * @abstract
         */
        presentResults: function(cat2quantities) {},

        /**
         * Should create the necessary plot canvasses
         *
         * @abstract
         */
        setUpPlot: function() {},

        /**
         * Indicates whether the view should show the plot canvas or not.
         *
         * @param {Boolean} show Whether to show the plot.
         * @abstract
         */
        showPlot: function(show) {},

        /**
         * Should trigger an update of the plot canvas
         *
         * @abstract
         */
        drawPlot: function() {},

        /**
         * Should change UI elements depending on whether the OpenACCEL model is being executed.
         *
         * @param executing Boolean indicating whether the OpenACCEL model is being executed.
         * @abstract
         */
        setExecuting: function(executing) {},

        /**
         * Informs the view about the current status of the program. This could be for instance
         * "Compiling", "Determining quantity categories", etc.
         *
         * @abstract
         */
        setStatus: function(status) {},

        /**
         * Signals the view that a new script object has been created.
         *
         * @abstract
         */
        loadedNewScript: function() {},

        /**
         * Informs the view that a runtime error has occured.
         *
         * @param {RuntimeError} err The error that occured during runtime.
         * @abstract
         */
        runtimeError: function(err) {}
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AbstractView;
});
