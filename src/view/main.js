var view = null;
var controller = null;
var canvasCreator = null;
var cm = null;

require(["../controller/ControllerAPI", "../controller/AbstractView", "../view/graphics/canvascreator", "../cm/lib/codemirror",
    "../cm/mode/javascript/javascript"],
    /**@lends View*/ function(Controller, AbstractView, CanvasCreator, CodeMirror) {
    /**
     * @class
     * @classdesc Interface declaring the methods that the view with which the Controller will
     * communicate should implement.
     */
    function View(canvasCreator) {
        this.canvasCreator = canvasCreator;
        this.canvas = null;
        this.optimisationCanvas = null;
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
        this.optimisationCanvas = canvasCreator.createCanvas(controller.getGeneticOptimisation(), 'plotGO', 400, 400);
    };

    /**
     * Show the plot canvas or hide it depending on the value of the passed parameter.
     *
     * @param {Boolean} show Whether to show the plot.
     */
    View.prototype.showPlot = function(show) {
        $('#plotdiv').toggle(show);
    };

    /**
     * Clears the plot canvas
     */
    View.prototype.clearPlot = function() {
        this.canvas.clearCanvas();
    };

    /**
     * Updates the plot canvas
     */
    View.prototype.drawPlot = function() {
        this.canvas.draw();
    };

    /**
     * Trigger an update of the optimisation plot canvas
     */
    View.prototype.drawOptimisationPlot = function() {
        this.optimisationCanvas.draw();
    };

    View.prototype.showOptimisationPlot = function(show) {
        $('#plotGOdiv').toggle(show);
    };

    View.prototype.clearOptimisationPlot = function() {
        this.optimisationCanvas.clearCanvas();
    };

    View.prototype.smartZoomOptimisation = function() {
        this.optimisationCanvas.smartZoom();
        this.drawOptimisationPlot();
    };

    View.prototype.zoomToFitOptimisation = function(show) {
        this.optimisationCanvas.zoomToFit();
        this.drawOptimisationPlot();
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
     * Resets the view to accomodate the new loaded script.
     */
    View.prototype.loadedNewScript = function() {
        resetEditRun();
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

    /**
     * Instantiate all global variables declared at the top of this file, using the
     * loaded modules.
     */
    canvasCreator = new CanvasCreator();

    view = new View(canvasCreator);
    controller = new Controller(view);
    view.setUpPlot();

    controller.setAutoExecute(true);
    controller.autoSave = true;
    controller.restoreSavedScript();

    // Setup CodeMirror instance
    cm = CodeMirror;
});
