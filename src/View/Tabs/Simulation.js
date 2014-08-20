require.config({
    baseUrl: "scripts"
});

define([], /**@lends View*/ function() {
    /**
     * @class
     * @classdesc The Simulation tab.
     */
    function Simulation() {

    }

    /**
     * Event that gets called when this tab gets opened.
     */
    Simulation.prototype.onEnterTab = function() {
        view.hasPlot = true;

        // If autoexecute is true, resume script only when it has been paused
        // by the system, and start executing when it is not paused but compiled
        if (controller.autoExecute) {
            if (controller.isPaused()) {
                controller.resume(true);
            } else {
                controller.run();
            }
        }
    };

    /**
     * Event that gets called when this tab gets closed.
     */
    Simulation.prototype.onLeaveTab = function() {
        // Pause script when leaving edit/run tab, indicating it has
        // been paused automatically by the system and not by the user
        controller.pause(true);
    };

    /**
     * Toggles the execution of the script.
     * 
     * @param {String} 'Run' if the script should be ran, otherwise it will be paused.
     */
    Simulation.prototype.toggleExecution = function(action) {
        if (action === 'Run') {
            controller.run();
            $('#runscriptSimulation').val('Pause');
        } else {
            controller.pause();
            $('#runscriptSimulation').val('Run');
        }
    };

    /**
     * Sets the amount of iterations the script should be ran.
     * 
     * @param {Number} The amount of iterations the script will be ran.
     */
    Simulation.prototype.setIterations = function(iterations) {
        controller.setIterations(iterations);
        controller.stop();
        controller.run();
    };

    return Simulation;
});
