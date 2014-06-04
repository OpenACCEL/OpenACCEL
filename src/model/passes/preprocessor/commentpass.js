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
define(["model/passes/preprocessor/compilerpass"], /**@lends Model.Passes.Preprocessor*/ function(CompilerPass) {
    /**
     * @class
     * @classdesc Pass removing lines that contain comments
     */
    function CommentPass() {}

    CommentPass.prototype = new CompilerPass();

    /**
     * Removes lines that are comments from the given array.
     * 
     * @param {String[]}    scriptlines Lines of script that need to be parsed.
     * @param {Object}      report A full report containing script information.
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @pre report != null
     * @pre report != undefined
     * @return {String[]}   the input
     */
    CommentPass.prototype.parse = function(scriptLines, report) {
        CompilerPass.prototype.parse.call(this, scriptLines, report);

        var output = [];

        scriptLines.forEach(function(line) {
            if (!(/\s*\/\//g).test(line)) {
                // The line does not start with a comment indicator, so we
                // have to keep it
                output.push(line);
            }
        });

        return output;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return CommentPass;
});
