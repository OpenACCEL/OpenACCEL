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
    function NamedVectorPass() {
        this.begin  = "\u261E";
        this.end    = "\u261C";
    }

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
        for (var i = 0; i < scriptLines.length; i++) {
            var line = scriptLines[i];
            NamedVectorPass.prototype.replaceBrackets(line);
        }

    };

    /**
     * Replaces some brackets([]) in line by curly braces ({}). The brackets that are replaced
     * are the ones that indicate creation of vectors, not of calling a vector.
     * @param  {String} line some line of the script
     * @pre line != null && line != undefined
     * @return {String} the same line with all brackets replaced by curly braces.
     */
    NamedVectorPass.prototype.replaceBrackets = function(line) {
        // First, we replace all '[' by '{' and ']' by '}', such that it becomes an object.
        // This way, we can identify when we go 'a level deeper'.
        line = line.replace(this.regexes.openingBracket, (function (s) { return s.replace("[", this.begin); }).bind(this));
        line = line.replace(this.regexes.closingBracket, (function (s) { return s.replace("]", this.end  ); }).bind(this));

        console.log(line);
        line = this.translate(line);
        line = line.split("\u2603").join(",");
        line = line.split(this.begin).join("{");
        line = line.split(this.end).join("}");

        return line
    }

    NamedVectorPass.prototype.translate = function(content) {
        // Final translated string.
        var output = content;
        var stepCase = false;

        // Find first begin token.
        var x = 0;
        for (var i = 0; i < content.length; i++) {
            if (content[i] == this.begin) { x = i; stepCase = true; break; }
        }

        // We have found a begin token, thus we have to find an end token.
        if (stepCase) {
            var level = 1;
            // Update the deepness level accordingly.
            for (var i = x + 1; i < content.length; i++) {
                if (content[i] == this.begin) {
                    level++;
                }
                else if (content[i] == this.end) {
                    level--;

                    // If level is 0, we have found the matching end token.
                    // We then need to recursively replace this substring with a translated substring.
                    if (level == 0) {
                        var substring = content.substring(x + 1, i);
                        console.log(substring);
                        output = output.replace(substring, this.translate(substring));
                    }
                }
            }
        }

        // We have not found a begin token at all, thus we are dealing with a base case and can start translating.
        var count       = 0;
        var elements    = output.split(",");

        // If an element does *not* contain a ':', it is unnamed and thus needs an index identifier.
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].indexOf(":") == -1) { elements[i] = "'" + count++ + "':" + elements[i]; }
        }

        output = elements.join("\u2603");

        return output;
    }



    // Exports are needed, such that other modules may invoke methods from this module file.
    return NamedVectorPass;
});