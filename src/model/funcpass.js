/**
 * We have two environments: the browser and Node. If we are in the browser we should use requirejs and call our functions that way.
 * If we are in node, we should not and instead should just export the various modules for testing purpose.
 *
 * @author Roel Jacobs
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
    sweetModule = "sweet.js";
} else {
    sweetModule = "sweet";

    require.config({
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: "scripts"
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define([sweetModule, "model/pass"], function(sweet, Pass) {
    /**
     * @class
     * @classdesc Pass that wraps each line of script in a "func(...)" statement.
     */
    function FuncPass() {}

    // Inheritance
    FuncPass.prototype = new Pass();

    /**
     * [parse description]
     * @param  {[type]} scriptLines [description]
     * @return {[type]}             [description]
     */
    FuncPass.prototype.parse = function(scriptLines) {
        // Precondition check
        Pass.prototype.parse.call(this, scriptLines);

        return scriptLines.map(function(line) {
            return "func(" + line + ")";
        });
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return FuncPass;
});