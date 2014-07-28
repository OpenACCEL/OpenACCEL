/*
 * File containing the Pass class. A single pass is a method applying a transformation or analysis
 * of the script from top to bottom.
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

define([], /**@lends Model.Analyser.Passes*/ function() {
    /**
     * @class
     * @classdesc Base class for passes of the preprocessor.
     */
    function Pass() {
        /**
         * Various utility regexes which may be usefull when performing passes.
         */
        this.regexes = {};


        /**
         * Regex extracting string-definitions
         * @type {RegExp}
         */
        this.stringregex = /(['"])(.*?)(\1)/g;

        /**
         * Regex to get all quantity identifiers that are NOT functions
         *
         * Warning!
         * This regex has one capturing group
         * so to get the actual variable name, look at this subgroup,
         * not at the complete match.
         * @type {RegExp}
         */
        this.regexes.identifier = /(?:^|[^\w.])(\w*[a-zA-Z_]\w*\b(?!\s*[\(:]))/g;

        /**
         * Regex to get all quantity identifiers, BOTH functions and others
         *
         * Warning!
         * This regex has one capturing group
         * so to get the actual variable name, look at this subgroup,
         * not at the complete match.
         * @type {RegExp}
         */
        this.regexes.variables = /(?:^|[^\w.])(\w*[a-zA-Z_]\w*\b(?!\s*:))/g;

        /**
         * Regex to get all quantity identifiers, BOTH functions and others
         *
         * Warning!
         * This regex has one capturing group
         * so to get the actual variable name, look at this subgroup,
         * not at the complete match.
         * @type {RegExp}
         */
        this.regexes.dummies = /(?:\#\(\s*)(\w*[a-zA-Z_]\w*)/g;

        // Regex to get all quantity identifiers that ARE functions
        this.regexes.function = /(\w+)(?=[(])/g;
        this.regexes.squareBrackets = /(\d*[a-zA-Z]+\w*)(\[\d*[a-zA-Z]+\w*\])/g;
        this.regexes.dots = /(\d*[a-zA-Z]+\w*)(\.\d+)/g;
        this.regexes.openingBracket = /(?:\W*)([(\[)])/g;
        this.regexes.closingBracket = /\]/g;
        this.regexes.vectorCall = /((\d*[a-zA-Z0-9]+\w*)(\[\d*[^\,|^\]]+\w*\]+))/g;
    }

    /**
     * Returns the left hand side of a definition,
     * that is, the part before the '=' sign.
     *
     * @param  {String} line String containing the definition
     * @pre line != null
     * @pre line != undefined
     * @return {String}      Left hand side of the definition
     */
    Pass.prototype.getLHS = function(line) {
        if (!line) {
            throw new Error('Pass.getLHS.pre violated :' +
                'line is null or undefined');
        }

        var equalsIndex = line.indexOf('=');

        return line.substring(0, equalsIndex).trim(); // Left hand side of the definition
    };

    /**
     * Returns the right hand side of a definition,
     * that is, the part after the '=' sign and before the ';' (if present).
     *
     * @param  {String} line String containing the definition
     * @pre line != null
     * @pre line != undefined
     * @return {String}      Right hand side of the definition
     */
    Pass.prototype.getRHS = function(line) {
        if (!line) {
            throw new Error('Pass.getRHS.pre violated :' +
                'line is null or undefined');
        }

        var equalsIndex = line.indexOf('=');

        // Is a unit defined?
        if (this.getUnits(line) === '') {
            return line.substring(equalsIndex + 1).trim();
        } else {
            var unitStart = line.lastIndexOf(';');
            return line.substring(equalsIndex + 1, unitStart).trim();
        }
    };

    /**
     * Returns the units of a definition,
     * that is, the part after the ';'
     *
     * @param  {String} line String containing the definition
     * @pre line != null
     * @pre line != undefined
     * @return {String}      Units of the definitions, empty String if no unit is present.
     */
    Pass.prototype.getUnits = function(line) {
        if (!line) {
            throw new Error('Pass.getUnits.pre violated :' +
                'line is null or undefined');
        }

        var unitStart = line.lastIndexOf(';');
        var beforeUnit = line.substring(0, unitStart);

        // Is a unit defined?
        if (unitStart === -1) {
            return '';
        } else {
            // Check whether this ; occured inside a string. If so, there
            // is not unit
            var countSingle = 0, countDouble = 0;
            posSingle = beforeUnit.indexOf("'");
            posDouble = beforeUnit.indexOf('"');

            while (posSingle != -1) {
               countSingle++;
               posSingle = beforeUnit.indexOf("'", posSingle+1);
            }
            while (posDouble != -1) {
               countDouble++;
               posDouble = beforeUnit.indexOf('"', posDouble+1);
            }

            if (countSingle % 2 !== 0 || countDouble % 2 !== 0) {
                return '';
            } else {
                return line.substring(unitStart + 1).trim();
            }
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Pass;
});
