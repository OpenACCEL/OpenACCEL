/*
 * File containing the CompilerPass class
 *
 * @author Jacco Snoeren
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

define(['model/passes/pass'], /**@lends CompilerPass*/ function(Pass) {
    /**
     * @class
     * @classdesc Abstract Pass that is part of compiling the script.
     */
    function CompilerPass() {}

    CompilerPass.prototype = new Pass();


    /**
     * Parse the given lines of script.
     * Should be overridden by subclasses.
     * The base class only contains precondition checking and returns the given input.
     *
     * @param {String[]} scriptlines Lines of script that need to be parsed.
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @return {String[]} the input
     */
    CompilerPass.prototype.parse = function(scriptLines) {
        if (!scriptLines) {
            throw new Error('CompilerPass.parse.pre violated :' +
                'scriptLines is null or undefined');
        }
        return scriptLines;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return CompilerPass;
});