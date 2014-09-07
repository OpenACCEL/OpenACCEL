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
        this.canvas = canvasCreator.createCanvas(new AnalysisModel(), "analysis_plot", 300, 300);
    }

    /**
     * Event that gets called when this tab gets opened.
     */
    Analysis.prototype.onEnterTab = function() {
        var analysis = this.canvas.getAnalysis();
        if (analysis) {
            analysis.setScript(controller.getScript());
            analysis.setDomain({x: {min:0, max: 10}});
            this.drawPlot();
        }
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

        // Update range values.
        var range = this.getRange();
        var rangeFrom = range.min.toFixed(4);
        var rangeTo = range.max.toFixed(4);
        $("#analysis_rangeFrom").val(rangeFrom);
        $("#analysis_rangeTo").val(rangeTo);

        // Update domain values.
        var domain = this.getDomain();

        var domainXFrom = domain.x.min.toFixed(4);
        var domainXTo = domain.x.max.toFixed(4);
        $("#analysis_domainXFrom").val(domainXFrom);
        $("#analysis_domainXTo").val(domainXTo);
    };

    /**
     * Sets the range of the plot window.
     * An example input would be: setRange({min: 5, max:10}).
     *
     * @throws {Error} An invalid range, meaning min >= max.
     * @param A range object, containing a min or max property, or both.
     */
    Analysis.prototype.setRange = function(range) {
        var analysis = this.canvas.getAnalysis();

        if (analysis) {
            analysis.setRange(range);
            this.setClamp(false);
            $("#analysis_toClamp").prop("checked", false);
            this.drawPlot();
        }
    };

    /**
     * @return The range of the plot window.
     */
    Analysis.prototype.getRange = function() {
        var analysis = this.canvas.getAnalysis();

        if (analysis) {
            return analysis.getRange();
        }
    };

    /**
     * Sets the domain of the plot window.
     * An example input would be: setRange({x: {min: 5, max:10}}).
     * There are two domains possible, the horizontal axis x,
     * and the vertical axes y (in case of contour plots).
     *
     * @throws {Error} An invalid range, meaning min >= max.
     * @param A range object, containing a min or max property, or both.
     */
    Analysis.prototype.setDomain = function(domain) {
        var analysis = this.canvas.getAnalysis();

        if (analysis) {
            analysis.setDomain(domain);
            this.drawPlot();
        }
    };

    /**
     * @return The range of the plot window.
     */
    Analysis.prototype.getDomain = function() {
        var analysis = this.canvas.getAnalysis();

        if (analysis) {
            return analysis.getDomain();
        }
    };

    /**
     * Sets whether the analysis plot should be clamped or not
     * If the plot should be clamped, it will be redrawn.
     *
     * @param {Boolean} Whether the plot window should be clamped or not.
     */
    Analysis.prototype.setClamp = function(bClamp) {
        this.canvas.handler.bClamp = bClamp;

        // If we were not clamped, we'll have to redraw the plot!
        if (bClamp) {
            this.drawPlot();
        }
    };

    /**
     * Sets the margin of clamping for the range.
     * The margin itself gets clamped between 0 and 95.
     *
     * @param {Number} The clamp margin.
     */
    Analysis.prototype.setClampMargin = function(margin) {
        if (margin < 0) {
            margin = 0;
        } else if (margin > 95) {
            margin = 95;
        }

        $("#analysis_clampMargin").val(margin.toFixed(4));
        this.canvas.handler.clampMargin = margin;

        // Redraw the plot if clamping was enabled.
        if (this.canvas.handler.bClamp) {
            this.drawPlot();
        }
    };

    return Analysis;
});
