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
define([], /**@lends AbstractView*/ function() {
    /**
     * @class AbstractView
     * @classdesc Interface declaring the methods that the view with which the Controller will 
     * communicate should implement.
     */
    function AbstractView() {
    }
    
    AbstractView.prototype = {
        /**
         * Should use the given map of quantities to update the UI lists.
         * NOTE: do NOT retrieve the values from these quantities for 
         * presenting the results!
         *
         * @param quantities {map<String, Quantity>} All the quantities
         * currently in the model, including todo quantities with empty
         * definitions.
         */
        setQuantities: function(quantities) { 
            console.log("Warning: AbstractView.prototype.setQuantities called but not implemented!");
        },

        /**
         * Should display the values of the given output quantities in the UI.
         *
         * @param cat2quantities {map<String, Quantity>} A map of all output
         * quantities in the script.
         */
        presentResults: function(cat2quantities) {
            console.log("Warning: AbstractView.prototype.presentResults called but not implemented!");
        },

        /**
         * Should change UI elements depending on whether the OpenACCEL model is being executed.
         *
         * @param executing Boolean indicating whether the OpenACCEL model is being executed.
         */
        setExecuting: function(executing) {
            console.log("Warning: AbstractView.prototype.setExecuting called but not implemented!");
        },
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AbstractView;
});
