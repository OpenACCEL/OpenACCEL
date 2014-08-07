require.config({
    baseUrl: "scripts"
});

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

        /**
         * The various canvasses that the view will use to plot and draw.
         */
        this.canvasses = {};
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
        /**
         * The small plot window that shows up in the Edit/Run tab.
         */
        this.canvasses.editRun = this.canvasCreator.createCanvas(controller.getScript(), 'plot', 300, 300);

        /**
         * This big plot window for the Simulation tab, which shows the same as the plot of Edit/Run.
         */
        //this.canvasses.simulation = this.canvasCreator.createCanvas(controller.getScript(), 'plotSimulation', 800, 600);

        /**
         * The canvas that is used to plot individuals of the Genetic Optimization tab.
         */
        this.canvasses.go = this.canvasCreator.createCanvas(controller.getGeneticOptimisation(), 'plotGO', 400, 400);
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
        this.canvasses.editRun.clearCanvas();
    };

    /**
     * Updates the plot canvas
     */
    WebView.prototype.drawPlot = function() {
        this.canvasses.editRun.draw();
    };

    /**
     * Trigger an update of the optimisation plot canvas
     */
    WebView.prototype.drawOptimisationPlot = function() {
        this.canvasses.go.draw();
    };

    WebView.prototype.showOptimisationPlot = function(show) {
        $('#plotGOdiv').toggle(show);
    };

    WebView.prototype.clearOptimisationPlot = function() {
        this.canvasses.go.clearCanvas();
    };

    WebView.prototype.smartZoomOptimisation = function() {
        this.canvasses.go.smartZoom();
        this.drawOptimisationPlot();
    };

    WebView.prototype.zoomToFitOptimisation = function(show) {
        this.canvasses.go.zoomToFit();
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
