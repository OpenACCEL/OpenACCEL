/*
 * A Parser for the ACCEL language.
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
    globalScope = process;
} else {
    globalScope = window;
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define(["Model/Compilation/Parsers/ACCELScriptParser",
        "Model/Compilation/Parsers/ACCELUnitParser",
        "Model/Library"], /**@lends Model.ACCELParser */

    function(scriptParser, unitParser, Library) {
        /**
         * @class
         * @classdesc
         */
        function ACCELParser(parser) {
            /**
             * The actual ACCEL JISON parser to use to parse the script.
             * Can either be the script or unit parser.
             */
            this.parser;

            /**
             * Whether the script parser has already been initialised
             *
             * @type {Boolean}
             */
            this.initialisedScriptParser = false;

            /**
             * The library used to obtain metadata about the ACCEL language.
             *
             * @type {Library}
             */
            this.lib = new Library();

            // Instantiate correct parser: units or entire script parser
            if (parser === 'unit') {
                this.parser = unitParser;
            } else {
                // Default value
                this.parser = scriptParser;

                if (this.initialisedScriptParser === false) {
                    // Set lists of standard and input functions once
                    this.parser.yy.inputfunctions = this.lib.getFunctions({'inputs':true});
                    this.parser.yy.stdfunctions = this.lib.getFunctions({'standard':true});
                    this.parser.yy.reservedwords = this.lib.getFunctions({'reserved':true, 'inputs':true, 'standard':true});

                    this.initialisedScriptParser = true;
                }
            }

            // Setup library and use it to configure the parser
        }

        /**
         * Parses the given piece of ACCEL script and returns the
         * parsed result. Does not handle any errors, that is for the
         * calling code to do.
         *
         * @param  {String} source The piece of ACCEL source to parse.
         * @return {String} The output of the ACCEL parser.
         */
        ACCELParser.prototype.parse = function(source) {
            return this.parser.parse(source);
        };

        /**
         * Sets whether the compiler should compile with units enabled or not.
         * This translates any number and string into a UnitObject.
         *
         * @param {Boolean} bUnits Whether numbers and strings should be compiled as UnitObjects.
         */
        ACCELParser.prototype.setUnits = function(bUnits) {
            this.parser.yy.units = bUnits;
        };

        // Exports all macros.
        return ACCELParser;
    });
