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

/**
 * The CodeMirror instance used to create an advanced editor in the IO/edit tab.
 *
 * @type {CodeMirror}
 */
var cm = null;

require.config({
    baseUrl: "scripts"
});

require(["Controller/ControllerAPI", "View/WebView", "cm/lib/codemirror",
    "cm/mode/ACCEL/ACCEL"],
    /**@lends View*/ function(Controller, View, CodeMirror) {

    view = new View();
    controller = new Controller(view);
    view.setUpPlot();

    controller.setAutoExecute(true);
    controller.autoSave = true;
    controller.restoreSavedScript();

    // Setup CodeMirror instance and also setup advanced editor in IO/edit tab
    // when preference in localStorage is set as such
    cm = CodeMirror;
    if (localStorage.useAdvancedEditor === 'true') {
        $('#useCM').prop("checked", true);
        toggleCM();
    }
});
