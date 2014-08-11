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
