/*
 * File containing the NamedNamedVectorPass class
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

define(['model/passes/preprocessor/compilerpass'], /**@lends NamedVectorPass*/ function(CompilerPass) {
    /**
     * @class
     * @classdesc Pass that replaces every reference to variable on the right
     * hand side of a definition by exe.<varname>().
     */
    function NamedVectorPass() {}

    NamedVectorPass.prototype = new CompilerPass();

    /**
     * Translate var1[var2] where var1 & var2 are not numbers
     * into var1.var2 and var1.var2 into var1[var2] where var2 is a number.
     * For example a[b] becomes a.b and a.0 becomes a[0].
     *
     * @param  {String[]} scriptLines Array of script lines.
     * @param {Report}      report A full report containing script information.
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @pre report != null
     * @pre report != undefined
     * @return {String} Line where var1[var2] is transformed in var1.var2
     */
    NamedVectorPass.prototype.parse = function(scriptLines, report) {
        CompilerPass.prototype.parse.call(this, scriptLines, report);
        return scriptLines.map((function(line) {
            // matches var1[var2] where var2 != 0
            line = this.dotToBrackets(line);
            line = this.bracketsToDot(line);
            return line;
        }).bind(this));
    };
    // Exports are needed, such that other modules may invoke methods from this module file.
    return NamedVectorPass;
});