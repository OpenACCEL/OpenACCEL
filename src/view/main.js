var controller = null;
var canvasCreator = null;

require(["../controller/ControllerAPI", "../controller/AbstractView", "../view/graphics/canvascreator"], /**@lends View*/ function(Controller, AbstractView, CanvasCreator) {
    /**
     * @class View
     * @classdesc Interface declaring the methods that the view with which the Controller will
     * communicate should implement.
     */
    function View(canvasCreator) {
        this.canvasCreator = canvasCreator;
        this.canvas = null;
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
     * Creates the necessary plot canvases
     */
    View.prototype.setUpPlot = function() {
        this.canvas = canvasCreator.createCanvas(controller.getScript(), 'plot', 300, 300);
    };

    /**
     * Show the plot canvas or hide it depending on the value of the passed parameter.
     *
     * @param {Boolean} show Whether to show the plot.
     */
    View.prototype.showPlot = function(show) {
        console.log('showPlot: ' + show);
        $('#plotdiv').toggle(show);
    };

    /**
     * Updates the plot canvas
     */
    View.prototype.drawPlot = function() {
        this.canvas.draw();
    };

    /**
     * Changes UI elements depending on whether the OpenACCEL model is being executed.
     *
     * @param executing Boolean indicating whether the OpenACCEL model is being executed.
     */
    View.prototype.setExecuting = function(executing) {
        setExecuting(executing);
    };

    /**
     * Displays the passed runtime error to the user.
     *
     * @param {RuntimeError} err The error that occured during runtime.
     */
    View.prototype.runtimeError = function(error) {
        console.log(error);
        handleError(error);
    };

    canvasCreator = new CanvasCreator();
    controller = new Controller(new View(canvasCreator));
    controller.view.setUpPlot();
    
    controller.setAutoExecute(true);
    controller.autoSave = true;
    controller.restoreSavedScript();
});
