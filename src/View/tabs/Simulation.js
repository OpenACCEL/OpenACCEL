$(document).ready(
    function() {
        $('#plotSimulationDiv').toggle(false);
    }
);

function toggleExecution(action) {
    if (action === 'Run') {
        controller.run();
    } else {
        controller.pause();
    }
}