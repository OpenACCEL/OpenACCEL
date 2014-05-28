/*
 * File containing the UIPass class
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
    function UIPass() {}

    UIPass.prototype = new CompilerPass();

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
    UIPass.prototype.parse = function(scriptLines, report) {
        CompilerPass.prototype.parse.call(this, scriptLines, report);
        return scriptLines.map((function(line) {
            if (line.match(/slider\(/) || line.match(/check\(/) || line.match(/button\(/) || line.match(/input\(/)) {
                lhs = this.getLHS(line);
                rhs = 'exe.' + lhs.split('(')[0] + '[0]'; // handles functions like f(x) as well
                line = line.replace(this.getRHS(line), rhs);
            }
            return line;
        }).bind(this));
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return UIPass;
});