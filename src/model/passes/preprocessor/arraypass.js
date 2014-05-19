/*
 * File containing the ArrayPass class
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

define(['model/passes/preprocessor/compilerpass'], /**@lends ArrayPass*/ function(CompilerPass) {
    /**
     * @class
     * @classdesc Pass that replaces every reference to variable on the right
     * hand side of a definition by exe.<varname>().
     */
    function ArrayPass() {}

    ArrayPass.prototype = new CompilerPass();

    /**
     * Translate var1[var2] where var1 & var2 are not numbers
     * into var1.var2. For example a[b] become a.b
     *
     * @param  {String[]} scriptLines Array of script lines.
     * @param {Report}      report A full report containing script information.
     * @pre scriptLines != null
     * @pre scriptLines != undefined
     * @pre report != null
     * @pre report != undefined
     * @return {String} Line where var1[var2] is transformed in var1.var2
     */
    ArrayPass.prototype.parse = function(scriptLines, report) {
        CompilerPass.prototype.parse.call(this, scriptLines, report);
        return scriptLines.map(function(line) {
            // matches var1[var2] where var2 != 0
            line = this.prototype.dotPass(scriptLines);
            line = this.prototype.bracketPass(scriptLines);
            return line;
        }
    });

    ArrayPass.prototype.bracketPass = function(scriptLines) {
        var rline = line.match(this.regexes.squareBrackets); 
            if (rline) {
                line = rline.replace('[', '.').replace(']', '');
            }
            return line;
    }

    ArrayPass.prototype.dotPass = function(scriptLines) {
        var rline = line.match(this.regexes.dots); 
            if (rline) {
                line = rline.replace(/\.\d+/, function(s) {
                    s = s.replace('.', '[');
                    s += ']';
                    return s;
                }); 
            }
            
            return line;
    }


    // Exports are needed, such that other modules may invoke methods from this module file.
    return ArrayPass;
});
