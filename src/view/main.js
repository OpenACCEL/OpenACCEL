var controller;
var canvasCreator;

require(["../controller/ControllerAPI", "../controller/AbstractView", "../view/descartes/canvascreator"], /**@lends View*/ function(Controller, AbstractView, CanvasCreator) {
    /**
     * @class View
     * @classdesc Interface declaring the methods that the view with which the Controller will
     * communicate should implement.
     */
    function View(canvasCreator) {
        this.canvasCreator = canvasCreator;
        this.descartesCanvas = null;
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
        synchronizeScriptArea();
    };

    /**
     * Displays the values of the given output quantities in the UI.
     *
     * @param cat2quantities {map<String, Quantity>} A map of all output
     * quantities in the script.
     */
    View.prototype.presentResults = function(cat2quantities) {
        synchronizeResults(cat2quantities);
    };

    /**
     * Trigger creation of the necessary plot canvases
     */
    View.prototype.setUpPlot = function(controller) {
        $('#plotdiv').toggle(true);
        this.descartesCanvas = canvasCreator.createDescartesCanvas(controller.getScript(), 'plot', 300, 300);
        console.log(this.descartesCanvas)
    };

    /**
     * Trigger an update of the plot canvas
     */
    View.prototype.drawPlot = function() {
        if (this.descartesCanvas) {
            this.descartesCanvas.handler.modelElement = controller.getScript();
            this.descartesCanvas.handler.draw();
        };
    };

    /**
     * Changes UI elements depending on whether the OpenACCEL model is being executed.
     *
     * @param executing Boolean indicating whether the OpenACCEL model is being executed.
     */
    View.prototype.setExecuting = function(executing) {
        setExecuting(executing);
    };

    canvasCreator = new CanvasCreator();

    //var canvasCreator = null; //TODO not null
    controller = new Controller(new View(canvasCreator));
    controller.setAutoExecute(true);
    // controller.autoSave = true;
    // controller.restoreSavedScript();
    controller.view.setUpPlot(controller);

});
