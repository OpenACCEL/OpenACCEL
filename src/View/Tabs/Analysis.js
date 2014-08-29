require.config({
    baseUrl: "scripts"
});

define(["View/Input", "View/HTMLBuffer", "Model/Analysis"], /**@lends View*/ function(Input, HTMLBuffer, AnalysisModel) {
    /**
     * @class
     * @classdesc The Analysis tab.
     */
    function Analysis(canvasCreator) {
        /**
         * The plot windopw where one quantity can be plotted against the other,
         * in case they are dependant on each other.
         */
        this.canvas = canvasCreator.createCanvas(new AnalysisModel(), 'plotAnalysis', 300, 300);
    }

    /**
     * Event that gets called when this tab gets opened.
     */
    Analysis.prototype.onEnterTab = function() {
        this.drawPlot();
    };

    /**
     * Event that gets called when this tab gets closed.
     */
    Analysis.prototype.onLeaveTab = function() {

    };

    /**
     * Clears the plot canvas
     */
    Analysis.prototype.clearCanvas = function() {
        this.canvas.clearCanvas();
    };

    /**
     * Updates the plot canvas
     */
    Analysis.prototype.drawPlot = function() {
        this.canvas.draw();
    };

    return Analysis;
});
