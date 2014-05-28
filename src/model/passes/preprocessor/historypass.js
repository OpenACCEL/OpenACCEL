/*
 * File containing the HistoryPass class
 *
 * @author Jacco Snoeren & Loc Tran
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
     * @classdesc Pass that replaces every reference to variable on the right
     * hand side of a definition by exe.<varname>().
     */
    function HistoryPass() {
        this.begin = "\u261E";
        this.end = "\u261C";
        this.otherBegin = '\u261B';
        this.otherEnd = '\u261A';
    }

    HistoryPass.prototype = new CompilerPass();

    /**
     * Translates 'x = myVar{...} to 'x =history(myVar,...)'.
     *
     * @param  {String[]} scriptLines Array of script lines.
     * @param {Object}      report A full report containing script information.
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @pre report != null
     * @pre report != undefined
     * @return {String} Line where x = myVar{...} is translated to 'x = history(myVar,...)'
     */
    HistoryPass.prototype.parse = function(scriptLines, report) {
        CompilerPass.prototype.parse.call(this, scriptLines, report);
        return scriptLines.map((function(line) {
            var pattern = /(\w*[a-zA-Z_]\w*)(?:\s*)(\{)/g;
            var rhs =  this.getRHS(line);
            rhs = rhs.replace(pattern, function(match, ident, brace) {

                return '__history__(' + ident + ', ';
            });

            rhs = rhs.replace(/\}/g, ')');

            line = line.replace(this.getRHS(line), rhs);
            return line;
        }).bind(this));
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return HistoryPass;
});