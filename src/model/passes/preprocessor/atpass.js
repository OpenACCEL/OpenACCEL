/*
 * @author Leo van Gansewinkel
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
     * @classdesc Pass replacing each instance of "@(...)" by "__at__(...)"
     */
    function AtPass() {
        /**
         * Regex to extract calls to the at-function
         * @type {RegExp}
         */
        this.atRegex = /(^|\W)(?:@(?=\())/g;
    }

    AtPass.prototype = new CompilerPass();


    /**
     * Replaces each instance of "@(...)" by "__at__(...)".
     *
     * @param {String[]}    scriptLines Array with script lines.
     * @param {Object}      report A full report containing script information.
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @pre report != null
     * @pre report != undefined
     * @return {String[]}             Array of translated lines
     */
    AtPass.prototype.parse = function(scriptLines, report) {
        // Preconsition checking.
        CompilerPass.prototype.parse.call(this, scriptLines, report);

        var result = scriptLines.map((function(line) {
            // Modfied RHS
            var rhs = this.getRHS(line);

            // Replace the if
            var newrhs = rhs.replace(this.atRegex, '$1__at__');

            return line.replace(rhs, newrhs);

        }).bind(this)); // Bind makes sure the context is correct.

        return result;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return AtPass;
});
