/**
 * The package pass packs all lines together into a function such that it can be evaluated with eval().
 *
 * @author Roy Stoof
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

define(["model/passes/pass"], function(Pass) {
    /**
     * @class
     * @classdesc Pass that wraps the lines in an executable for eval().
     */
    function PackagePass() {}

    // Inheritance
    PackagePass.prototype = new Pass();

    /**
     * Wraps the lines inside a package, ready to be evalled by eval() such that you get a executable javascript object.
     * @param  {String[]} scriptLines Array of script lines
     * @return {String[]}             Array in which each line of the input is wrapped in a "func(...)" statement.
     */
    PackagePass.prototype.parse = function(scriptLines) {
        // Precondition check
        Pass.prototype.parse.call(this, scriptLines);

        scriptLines.unshift("(function () { exe = {}; ");
        scriptLines.push("return exe; })()");

        return scriptLines;
    }

    // Export.
    return PackagePass;
});