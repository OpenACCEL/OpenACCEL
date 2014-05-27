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
            line = this.replaceBrackets(line);
            return line;
        }).bind(this));
    };

    /**
     * [keepBrackets description]
     * @param  {[type]} line [description]
     * @return {[type]}      [description]
     */
    HistoryPass.prototype.keepBrackets = function(line) {
        var output = line;
        var x = 1;
        for (var i = x; i < line.length; i++) {
            // We have found a begin token, thus we have to find an end token.
            if (line[i] == "[" && line[i - 1].match(/\w/)) {
                x = i;
                var level = 1;
                // Update the deepness level accordingly.
                for (var j = x + 1; j < line.length; j++) {
                    if (line[j] == "[") {
                        level++;
                    } else if (line[j] == "]") {
                        level--;

                        // If level is 0, we have found the matching end token.
                        // We then need to recursively replace this substring with a translated substring.
                        if (level == 0) {
                            var substring = line.substring(x + 1, j);
                            output = output.replace(substring, this.keepBrackets(substring));
                            output = this.replaceAt(output, x, this.otherBegin);
                            output = this.replaceAt(output, j, this.otherEnd);
                            i = j; // When we want to look for a next begin token, thus we start where we have now ended.
                            break;
                        }
                    }
                }
            }
        }
        return output;
    }

    HistoryPass.prototype.replaceAt = function(line, idx, chr) {
        var left = line.substring(0, idx);
        var right = line.substring(idx + 1);
        return left + chr + right;
    }
    /**
     * Replaces some brackets([]) in line by curly braces ({}). The brackets that are replaced
     * are the ones that indicate creation of vectors, not of calling a vector.
     * @param  {String} line some line of the script
     * @pre line != null && line != undefined
     * @return {String} the same line with all brackets replaced by curly braces.
     */
    HistoryPass.prototype.replaceBrackets = function(line) {
        // First, we replace all '[' by '{' and ']' by '}', such that it becomes an object.
        // This way, we can identify when we go 'a level deeper'.
        var units = this.getUnits(line);
        var lhs = this.getLHS(line);
        line = this.getRHS(line);

        line = this.keepBrackets(line);


        if (units) {
            return lhs + " = " + line + " ; " + units;
        } else {
            return lhs + " = " + line;
        }
    };


    // Exports are needed, such that other modules may invoke methods from this module file.
    return HistoryPass;
});