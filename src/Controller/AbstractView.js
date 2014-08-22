/**
 * AbstractView.
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
define([], /**@lends Controller*/ function() {
    /**
     * @class
     * @classdesc Interface declaring the methods that the view with which the Controller will
     * communicate should implement.
     */
    function AbstractView() {}

    /**
     * Clears the plot canvas
     */
    AbstractView.prototype.clearCanvas = function() {

    };

    /**
     * Updates the plot canvas
     */
    AbstractView.prototype.drawPlot = function() {

    };

    /**
     * Event that gets called when one of the quantity definitions have been modified.
     */
    AbstractView.prototype.onModifiedQuantity = function() {

    }

    /**
     * Event that gets called when the controller has issued a new iteration for the script.
     */
    AbstractView.prototype.onNextStep = function() {

    }

    /**
     * Event that gets called when the controller has compiled a new script.
     */
    AbstractView.prototype.onNewScript = function() {

    }

    /**
     * Event that gets called when the genetic algorithm has generated a new generation.
     */
    AbstractView.prototype.onNewGeneration = function() {

    }

    /**
     * Resets all canvasses and plots, such that they are as good as new!
     */
    AbstractView.prototype.resetAllPlots = function() {

    }

    /**
     * Changes UI elements depending on whether the OpenACCEL model is being executed.
     *
     * @param executing Boolean indicating whether the OpenACCEL model is being executed.
     */
    AbstractView.prototype.setExecuting = function(executing) {

    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AbstractView;
});
