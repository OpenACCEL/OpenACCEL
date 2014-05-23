/*
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
        baseUrl: "scripts"
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define(['model/passes/preprocessor/compilerpass'], /**@lends Model.Passes.Preprocessor*/ function(CompilerPass) {
    /**
     * @class
     * @classdesc Class that replaces a binary operator in the right hand side of a definitions 
     * by ' _operator_ ' (including spaces), so it can be processed properly by sweet.
     */
    function OperatorPass() {
        /**
         * Regex to extract binary operators.
         * @type {RegExp}
         */
        this.operatorRegex = /([\+\-\*\/%])/g;
    }

    OperatorPass.prototype = new CompilerPass();


     /**
     * Replaces a binary operator in the right hand side of a definitions 
     * by ' _operator_ ' (including spaces).
     *
     * @param {String[]}    scriptLines Array with script lines.
     * @param {Object}      report A full report containing script information.
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @pre report != null
     * @pre report != undefined
     * @return {String[]}             Array of translated lines
     */
    OperatorPass.prototype.parse = function(scriptLines, report) {
        // Preconsition checking.
        CompilerPass.prototype.parse.call(this, scriptLines, report);

        var result = scriptLines.map((function(line) {
            // This inner function replaces the binary operator in a single line.

            // Modfied RHS
            var newrhs = this.getRHS(line);

            // Replace the operators.
            // We *need* to add spaces, because sweet otherwise gives an error.
            newrhs = newrhs.replace(this.operatorRegex, function(op) {
                return ' _' + op + '_ ';
            });

            return line.replace(this.getRHS(line), newrhs);

        }).bind(this)); // Bind makes sure the context is correct.

        return result;
    };


    // Exports are needed, such that other modules may invoke methods from this module file.
    return OperatorPass;
});
