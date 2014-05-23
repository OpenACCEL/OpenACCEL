/*
 * File containing the FuncPass class
 *
 * @author Roel Jacobs
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

define(['model/passes/preprocessor/compilerpass'], /**@lends Model.Passes.Preprocessor*/ function(CompilerPass) {
    /**
     * @class
     * @classdesc Pass that wraps each line of script in a 'func(...)' statement.
     */
    function FuncPass() {}

    // Inheritance
    FuncPass.prototype = new CompilerPass();

    /**
     * Wraps each line of script in a 'func(...)' statement.
     * @param  {String[]} scriptLines Array of script lines.
     * @param {Object}      report A full report containing script information.
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @pre report != null
     * @pre report != undefined
     * @return {String[]}             Array in which each line of the input is wrapped in a 'func(...)' statement.
     */
    FuncPass.prototype.parse = function(scriptLines, report) {
        // Precondition check
        CompilerPass.prototype.parse.call(this, scriptLines, report);

        return scriptLines.map(function(line) {
            return 'func(' + line + ')';
        });
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return FuncPass;
});
