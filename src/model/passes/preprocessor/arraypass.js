/*
 * File containing the VectorPass class
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

define(['model/passes/preprocessor/compilerpass'], /**@lends VectorPass*/ function(CompilerPass) {
    /**
     * @class
     * @classdesc Pass that replaces every reference to variable on the right
     * hand side of a definition by exe.<varname>().
     */
    function VectorPass() {}

    VectorPass.prototype = new CompilerPass();

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
    VectorPass.prototype.parse = function(scriptLines, report) {
        CompilerPass.prototype.parse.call(this, scriptLines, report);
        return scriptLines.map((function(line) {
            // matches var1[var2] where var2 != 0
            line = this.dotToBrackets(line);
            line = this.bracketsToDot(line);
            return line;
        }).bind(this));
    };

    /**
     * Replaces var1[var2] by var1.var2 if var2 is not a number.
     * Example: a[x] becomes a.x
     * @param  {String[]} lone Array of script lines.
     * @pre line != null && line != undefined
     * @return {String[]} thes cript where var1[var2] is transformed in var1.var2
     */
    VectorPass.prototype.bracketsToDot = function(line) {
        line = line.replace(this.regexes.squareBrackets, function(rhs) {
            if (rhs) {
                rhs = rhs.replace('[', '.').replace(']', '');
            }
            return rhs;
        });
        return line;
    };

    /**
     * Replaces var1.var2 into var1[var2] where var2 is a number.
     * Example: a[0] becomes a[0]
     * @param  {String[]} line Array of script lines.
     * @pre line != null && line != undefined
     * @return {String[]} the script where var1[var2] is transformed in var1.var2
     */
    VectorPass.prototype.dotToBrackets = function(line) {
        line = line.replace(this.regexes.dots, function(rhs) {
            if (rhs) {
                rhs = rhs.replace(/\.\d+/, function(s) {
                    s = s.replace('.', '[');
                    s += ']';
                    return s;
                });
                return rhs;
            }
        });
        return line;
    };


    // Exports are needed, such that other modules may invoke methods from this module file.
    return VectorPass;
});