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
define(["controller/AbstractView"], /**@lends View*/ function(AbstractView) {
    /**
     * @class View
     * @classdesc Interface declaring the methods that the view with which the Controller will 
     * communicate should implement.
     */
    function View() {
    	
    }

    View.prototype = new AbstractView();
    
    /**
     * Should use the given map of quantities to update the UI lists.
     * NOTE: do NOT retrieve the values from these quantities for 
     * presenting the results!
     *
     * @param quantities {map<String, Quantity>} All the quantities
     * currently in the model, including todo quantities with empty
     * definitions.
     */
    View.prototype.setQuantities = function(quantities) { 
        console.log("Warning: View.prototype.setQuantities called but not implemented!");
    };

    /**
     * Should display the values of the given output quantities in the UI.
     *
     * @param cat2quantities {map<String, Quantity>} A map of all output
     * quantities in the script.
     */
    View.prototype.presentResults = function(cat2quantities) {
        console.log("Warning: View.prototype.presentResults called but not implemented!");
    };

	return View;
});
