/*
 * The package pass packs all lines together into a function such that it can be evaluated with eval().
 *
 * @author Roy Stoof
 */

/* Browser vs. Node ***********************************************/
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

define(["model/passes/preprocessor/compilerpass"], /**@lends Model.Passes.Preprocessor*/ function(CompilerPass) {
    /**
     * @class
     * @classdesc Pass that wraps the lines in an executable for eval().
     */
    function PackagePass() {}

    // Inheritance
    PackagePass.prototype = new CompilerPass();

    /**
     * Wraps the lines inside a package, ready to be evalled by eval() such that you get a executable javascript object.
     * @param {String[]}    scriptLines Array of script lines.
     * @param {Object}      report A full report containing script information.
     * @return {String[]}   Array in which each line of the input is wrapped in a "func(...)" statement.
     */
    PackagePass.prototype.parse = function(scriptLines, report) {
        // Precondition check
        CompilerPass.prototype.parse.call(this, scriptLines, report);

        scriptLines.unshift("(function () { exe = {}; ");
        scriptLines.push("return exe; })()");

        return scriptLines;
    };

    // Export.
    return PackagePass;
});
