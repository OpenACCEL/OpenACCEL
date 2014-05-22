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
        this.begin = "\u261E";
        this.end = "\u261C";
        this.otherBegin = '\u261B';
        this.otherEnd = '\u261A';
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
        return scriptLines.map((function(line) {
            // matches var1[var2] where var2 != 0
            line = this.replaceBrackets(line);
            return line;
        }).bind(this));
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
        var units = this.getUnits(line);
        var lhs = this.getLHS(line);
        line = this.getRHS(line);

        line = line.replace(this.regexes.vectorCall, (function(s) {
            s = s.split("[").join(this.otherBegin);
            return s.split("]").join(this.otherEnd);
        }).bind(this));

        line = line.replace(this.regexes.openingBracket, (function(s) {
            return s.split("[").join(this.begin);
        }).bind(this));

        line = line.replace(this.regexes.closingBracket, (function(s) {
            return s.split("]").join(this.end);
        }).bind(this));

        line = this.translate(line, true);
        line = line.split("\u2603").join(",");
        line = line.split(this.begin).join("{");
        line = line.split(this.end).join("}");
        line = line.split(this.otherBegin).join('[');
        line = line.split(this.otherEnd).join(']');

        if (units) {
            return lhs + " = " + line + " ; " + units;
        } else {
            return lhs + " = " + line;
        }
    };

    NamedVectorPass.prototype.translate = function(content, parent) {
        // Final translated string.
        var output = content;

        // Find first begin token.
        var x = 0;
        for (var i = x; i < content.length; i++) {
            // We have found a begin token, thus we have to find an end token.
            if (content[i] == this.begin) {
                x = i;
                var level = 1;
                // Update the deepness level accordingly.
                for (var j = x + 1; j < content.length; j++) {
                    if (content[j] == this.begin) {
                        level++;
                    } else if (content[j] == this.end) {
                        level--;

                        // If level is 0, we have found the matching end token.
                        // We then need to recursively replace this substring with a translated substring.
                        if (level == 0) {
                            var substring = content.substring(x, j);
                            output = output.replace(substring,  this.begin + this.translate(substring.substring(1, substring.length), false));

                            i = j; // When we want to look for a next begin token, thus we start where we have now ended.
                            break;
                        }
                    }
                }
            }
        }

        if (!parent) {
            // We have not found a begin token at all, thus we are dealing with a base case and can start translating.
            var count = 0;
            var elements = output.split(",");

            // If an element does *not* contain a ':', it is unnamed and thus needs an index identifier.
            for (var i = 0; i < elements.length; i++) {
                var key = elements[i].split(this.begin);
                if (key[0].indexOf(":") == -1) {
                    elements[i] = "'" + count+++"':" + elements[i];
                }
            }
            output = elements.join("\u2603");

        }
        return output;
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return NamedVectorPass;
});