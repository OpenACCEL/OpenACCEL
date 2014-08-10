/**
 * The instance of the AbstractView that will communicate with the controller. Defined below.
 *
 * @type {AbstractView}
 */
var view = null;

/**
 * The controller that manages the application state. Created by the view when the view is
 * instantiated.
 *
 * @type {Controller}
 */
var controller = null;

require.config({
    baseUrl: "scripts"
});

require(["Controller/ControllerAPI", "View/WebView"],
    /**@lends View*/ function(Controller, View) {

    view = new View();
    controller = new Controller(view);
    view.setUpPlot();

    controller.setAutoExecute(true);
    controller.autoSave = true;
    controller.restoreSavedScript();
});
