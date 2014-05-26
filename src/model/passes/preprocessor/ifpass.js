/*
 * @author Roel Jacobs
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode    = !inBrowser;

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
     * @classdesc Pass replacing each instance of "if(...)" by "__if__(...)"
     */
    function IfPass() {
        /**
         * Regex to extract calls to the if-function
         * @type {RegExp}
         */
        this.ifRegex = /(if(?=\())/g;
    }

    IfPass.prototype = new CompilerPass();


     /**
     * Replaces each instance of "if(...)" by "__if__(...)".
     *
     * @param {String[]}    scriptLines Array with script lines.
     * @param {Object}      report A full report containing script information.
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @pre report != null
     * @pre report != undefined
     * @return {String[]}             Array of translated lines
     */
    IfPass.prototype.parse = function(scriptLines, report) {
        // Preconsition checking.
        CompilerPass.prototype.parse.call(this, scriptLines, report);

        var result = scriptLines.map((function(line) {
            // This inner function replaces the binary operator in a single line.

            // Modfied RHS
            var newrhs = this.getRHS(line);

            // Replace the operators.
            // We *need* to add spaces, because sweet otherwise gives an error.
            newrhs = newrhs.replace(this.ifRegex, function(op) {
                return '__' + op + '__';
            });

            return line.replace(this.getRHS(line), newrhs);

        }).bind(this)); // Bind makes sure the context is correct.

        return result;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return IfPass;
});
