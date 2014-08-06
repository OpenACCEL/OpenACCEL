define(["../Controller/AbstractView",
        "../View/Graphics/CanvasCreator"],
        /**@lends View*/
        function(AbstractView, CanvasCreator) {
    /**
     * @class
     * @classdesc The webview is the view class for webbrowsers.
     */
    function WebView() {
        /**
         * The CanvasCreator is responsible for creating drawable canvases for e.g. the Network tab and
         * script visualisations.
         *
         * @type {CanvasCreator}
         */
        this.canvasCreator = new CanvasCreator();

        this.canvas = null;
        this.optimisationCanvas = null;
    }

    WebView.prototype = new AbstractView();

    /**
     * Uses the given map of quantities to update the UI.
     *
     * @param quantities {map<String, Quantity>} All the quantities
     * currently in the model, including todo quantities with empty
     * definitions.
     */
    WebView.prototype.setQuantities = function(quantities) {
        // Update quantity list in edit/run tab
        synchronizeScriptList(quantities);

        // Update textarea/advanced editor in IO/edit
        synchronizeScriptArea();
    };

    /**
     * Displays the values of the given output quantities in the UI.
     *
     * @param cat2quantities {map<String, Quantity>} A map of all output
     * quantities in the script.
     */
    WebView.prototype.presentResults = function(cat2quantities) {
        synchronizeResults(cat2quantities);
    };

    /**
     * Creates the necessary plot canvases
     */
    WebView.prototype.setUpPlot = function() {
        this.canvas = this.canvasCreator.createCanvas(controller.getScript(), 'plot', 300, 300);
        this.simulationCanvas = this.canvasCreator.createCanvas(controller.getScript(), 'plotSimulation', 800, 600);
        this.optimisationCanvas = this.canvasCreator.createCanvas(controller.getGeneticOptimisation(), 'plotGO', 400, 400);
    };

    /**
     * Shows/hides the plot canvas.
     *
     * @param {Boolean} show Whether to show the plot.
     */
    WebView.prototype.showPlot = function(show) {
        $('#plotdiv').toggle(show);
    };

    /**
     * Clears the plot canvas
     */
    WebView.prototype.clearPlot = function() {
        this.canvas.clearCanvas();
    };

    /**
     * Updates the plot canvas
     */
    WebView.prototype.drawPlot = function() {
        this.canvas.draw();
    };

    /**
     * Trigger an update of the optimisation plot canvas
     */
    WebView.prototype.drawOptimisationPlot = function() {
        this.optimisationCanvas.draw();
    };

    WebView.prototype.showOptimisationPlot = function(show) {
        $('#plotGOdiv').toggle(show);
    };

    WebView.prototype.clearOptimisationPlot = function() {
        this.optimisationCanvas.clearCanvas();
    };

    WebView.prototype.smartZoomOptimisation = function() {
        this.optimisationCanvas.smartZoom();
        this.drawOptimisationPlot();
    };

    WebView.prototype.zoomToFitOptimisation = function(show) {
        this.optimisationCanvas.zoomToFit();
        this.drawOptimisationPlot();
    };

    /**
     * Changes UI elements depending on whether the OpenACCEL model is being executed.
     *
     * @param executing Boolean indicating whether the OpenACCEL model is being executed.
     */
    WebView.prototype.setExecuting = function(executing) {
        setExecuting(executing);
    };

    /**
     * Resets the view to accomodate the newly loaded script.
     */
    WebView.prototype.loadedNewScript = function() {
        resetEditRun();
        synchronizeScriptArea();
    };

    /**
     * Displays the passed runtime error to the user.
     *
     * @param {RuntimeError} err The error that occured during runtime.
     */
    WebView.prototype.runtimeError = function(error) {
        console.log(error);
        handleError(error);
    };

    return WebView;
});
