var controller;

require(["../controller/ControllerAPI", "../controller/AbstractView"], /**@lends View*/ function(Controller, AbstractView) {
    /**
     * @class View
     * @classdesc Interface declaring the methods that the view with which the Controller will 
     * communicate should implement.
     */
    function View() {
    	
    }

    View.prototype = new AbstractView();
    
    /**
     * Uses the given map of quantities to update the UI lists.
	 *
     * @param quantities {map<String, Quantity>} All the quantities
     * currently in the model, including todo quantities with empty
     * definitions.
     */
    View.prototype.setQuantities = function(quantities) { 
        synchronizeScriptList(quantities);
    };

    /**
     * Displays the values of the given output quantities in the UI.
     *
     * @param cat2quantities {map<String, Quantity>} A map of all output
     * quantities in the script.
     */
    View.prototype.presentResults = function(cat2quantities) {
        synchronizeResults(cat2quantities);
        //Shows iterative execution
        console.log('Output');
    };

    /**
     * Changes UI elements depending on whether the OpenACCEL model is being executed.
     *
     * @param executing Boolean indicating whether the OpenACCEL model is being executed.
     */
    View.prototype.setExecuting = function(executing) {
        setExecuting(executing);
    };

    controller = new Controller(new View());
});
