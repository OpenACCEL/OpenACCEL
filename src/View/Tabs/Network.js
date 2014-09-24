require.config({
    baseUrl: "scripts"
});

define(["Model/Network/Network"], /**@lends View*/ function(NetworkModel) {
    /**
     * @class
     * @classdesc The Network tab.
     */
    function Network(canvasCreator) {
        this.canvas = canvasCreator.createCanvas(new NetworkModel(), "network_plot", 800, 600);

        /**
         * The loop that is necessary to update the plot.
         */
        this.drawLoop = undefined;
    }

    /**
     * Event that gets called when this tab gets opened.
     */
    Network.prototype.onEnterTab = function() {
        view.hasPlot = true;

        // Find out whether the controller has a script, and build a network out of it.
        var script = controller.getScript();
        if (script) {
            this.canvas.getNetwork().setScript(script);

            this.drawLoop = setInterval(
                (function() {
                    this.drawPlot();
                }).bind(this), 16
            );
        }
    };

    /**
     * Event that gets called when this tab gets closed.
     */
    Network.prototype.onLeaveTab = function() {
        clearInterval(this.drawLoop);
    };

    /**
     * Clears the plot canvas
     */
    Network.prototype.clearCanvas = function() {
        this.canvas.clearCanvas();
    };

    /**
     * Updates the plot canvas
     */
    Network.prototype.drawPlot = function() {
        this.canvas.draw();
    };

    return Network;
});
