/**
 *
 * @author Edward Brinkmann
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
define(["controller/ControllerAPI", "model/quantity"], function(Controller, Quantity) {
    /**
     * @class AbstractView
     * @classdesc Interface declaring the methods that the view with which the Controller will 
     * communicate should implement.
     */
    function AbstractView(source) {
    }

    
    AbstractView.prototype = {

    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AbstractView;
});