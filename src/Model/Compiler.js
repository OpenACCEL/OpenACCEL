/*
 * Central compiling point. Code goes in, executable goes out.
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
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define(["Model/FileLoader",
        "Model/Library",
        "underscore",
        "Model/Parser",
        "Model/UnitParser",
        "Model/Exceptions/SyntaxError",
        "Model/Executable"
    ], /**@lends Model.Compiler */
    function(FileLoader,
        Library,
        _,
        parser,
        unitParser,
        SyntaxError,
        Executable) {

        /**
         * @class
         * @classdesc The Compiler compiles the raw ACCEL source code of the script into
         * executable Javascript code.
         *
         * Compilation is done by first parsing the source code using a lexical scanner and parser
         * and subsequently expanding the macro's that the parser put in.
         */
        function Compiler() {
            /**
             * The parser that will be used to parse inputted ACCEL code
             * and construct the executable from it. This does not translate units.
             */
            this.parser = parser;

            /**
             * The parser that will be used to translate ACCEL units into
             * workable objects. This is a separate parser, as the language including units
             * is not a context-free language. By separating the units part from the
             * actual language part, the entire ACCEL language can be considered
             * as two context-free languages.
             */
            this.unitParser = unitParser;

            /**
             * All the quantities in the script to be compiled.
             *
             * @type {Map<String, Quantity>}
             */
            this.quantities = null;

            /**
             * Contains the quantities for which the history has been checked
             */
            this.historyChecked = [];

            /**
             * The total number of quantities in the script being compiled.
             */
            this.totalNumQuantities = 0;

            /**
             * List of all library functions (executable!) supported by OpenACCEL.
             */
            this.libraries = {};
            this.libraries.std = [];

            /**
             * Whether the compiler should compile with unit support or not.
             *
             * @type {Boolean}
             */
            this.units = false;

            /**
             * The file loader is reponsible for loading all files, like macros and library functions.
             */
            this.fileLoader = new FileLoader();

            // Load the standard library into memory, and evaluate them
            this.fileLoader.load("Functions", "library");
            this.fileLoader.load("Functions", "unitlibrary");

            eval.call(globalScope, this.fileLoader.getLibrary());

            // Store a copy of the standard library in memory so it can be referenced from any other
            // library (at the moment: the unit library)
            var library = new Library();
            for (var i = 0; i < library.std.length; ++i) {
                var func = library.std[i];
                this.libraries.std[func] = eval(func);
            }
        }

        /**
         * Compiles a piece of ACCEL code and outputs an object, containing an executable.
         *
         * @param {Script} script The ACCEL script to be compiled.
         * @return {Executable} The executable that is the result of compiling the given script.
         */
        Compiler.prototype.compile = function(script) {
            // Save the quantities of the script once so we don't have to query them every time in
            // the recursive compiler methods further down
            this.quantities = script.getQuantities();

            // Determine all time-dependent quantities
            this.determineTimeDependencies();

            // The code will be incrementally "build"/generated and each intermediate result will be stored
            // in this variable
            var code;

            // Parse the script with the lexical scanner + parser. Do this before checking e.g. the time dependencies
            // and setting user input values to make sure the script is valid first
            code = this.parse(script.getSource());

            // Now that the quantities are parsed and expanded, we may extend the quantities
            // with their unit, if they have any.
            code += this.parseUnits(script);

            // Create Executable with the parsed code
            exe = new Executable(code, this.quantities);

            // Store library references in the executable.
            exe.lib = this.libraries;
            exe.units = this.units;

            return exe;
        };

        /**
         * Parses the code using the generated lexical scanner and parser stored
         * in this.parser. Throws SyntaxErrors if parsing fails.
         *
         * @param {String} code The code to parse.
         * @return {String} The parsed code as returned by the parser.
         * @throws {SyntaxError} If parsing fails
         */
        Compiler.prototype.parse = function(code) {
            // Parse the script and handle any syntax errors
            try {
                code = this.parser.parse(code);
            } catch (e) {
                if (!e.hash) {
                    throw e;
                }

                var err = new SyntaxError();

                err.found = e.hash.text;
                err.expected = e.hash.expected;
                err.firstLine = e.hash.loc.first_line;
                err.lastLine = e.hash.loc.last_line;
                err.startPos = e.hash.loc.first_column;
                err.endPos = e.hash.loc.last_column;
                err.message = e.message;

                throw err;
            }

            return code;
        };

        /**
         * Parse the units for each quantity separately from the source code, and add the parsed
         * information to the quantities in the executable.
         *
         * @param  {Script} script The entire script, including source and units.
         * @return {String}        String of executable javascript code that adds units to quanities.
         * @throws {SyntaxError}   If parsing fails
         */
        Compiler.prototype.parseUnits = function(script) {
            // Parse the units and handle any syntax errors
            var unitCode = "";

            try {
                // For each quantity, get the unit, parse it and add to the quantity in the executable.
                var quantities = script.getQuantities();

                for (var qtyName in quantities) {
                    var qty = quantities[qtyName];

                    if (!qty.unit || qty.unit === '') {
                        continue;
                    }

                    unitCode += "this.__" + qtyName + "__.unit=" + this.unitParser.parse(qty.unit) + ";";
                }

                return unitCode;
            } catch (e) {
                if (!e.hash) {
                    throw e;
                }

                // Syntaxerror occured if it has a 'hash' property.
                // Add the error location to the length of the quantity definition to
                // get the correct position!
                var err = new SyntaxError();

                err.found = e.hash.text;
                err.expected = e.hash.expected;
                err.firstLine = e.hash.loc.first_line;
                err.lastLine = e.hash.loc.last_line;
                err.startPos = e.hash.loc.first_column;
                err.endPos = e.hash.loc.last_column;
                err.message = e.message;

                throw err;
            }
        };

        /**
         * Sets whether the compielr should compile with units enabled or not.
         * This translates any number and string into a UnitObject.
         *
         * @param {Boolean} bUnits Whether numbers and stirngs should be compiled as UnitObjects.
         */
        Compiler.prototype.setUnits = function(bUnits) {
            this.units = bUnits;
            this.parser.yy.units = bUnits;

            if (bUnits) {
                eval.call(globalScope, this.fileLoader.getLibrary("unitlibrary"));
            } else {
                eval.call(globalScope, this.fileLoader.getLibrary());
            }
        };

        /**
         * Flags all time-dependent quantities in this.quantities as such
         *
         * @modifies this.quantities
         */
        Compiler.prototype.determineTimeDependencies = function() {
            this.historyChecked = [];
            this.totalNumQuantities = _.size(this.quantities);

            var historyQuantities = this.getTimeDependentQuantities();
            for (var qty in historyQuantities) {
                this.setTimeDependent(historyQuantities[qty], true);
            }
        };

        /**
         * Recursively sets whether the given quantity, and all quantities depending on it,
         * are time-dependent.
         *
         * @param {Quantity} quantity The quantity to use as starting point. All of it's reverse dependencies, if any, are checked recursively.
         * @param {Boolean} timeDependent Whether to mark quantity and it's reverse dependencies as time dependent or not.
         */
        Compiler.prototype.setTimeDependent = function(quantity, timeDependent) {
            // Base case: this quantity and all of it's reverse dependencies
            // have already been marked as time-dependent
            if (this.historyChecked.indexOf(quantity.name) >= 0) {
                return;
            }

            quantity.isTimeDependent = timeDependent;
            this.historyChecked.push(quantity.name);
            //console.log ("Starting " + quantity.name);
            for (var depIndex in quantity.reverseDeps) {
                var depName = quantity.reverseDeps[depIndex];
                this.setTimeDependent(this.quantities[depName], timeDependent);
            }
        };

        /**
         * Returns all quantities in this.quantities marked as time-dependent by the analyser.
         * First step in determining ALL time-dependent quantities.
         *
         * @return A map of all quantities in this.quantities marked as time-dependent,
         * keyed by quantity name.
         */
        Compiler.prototype.getTimeDependentQuantities = function() {
            var tdquantities = {};

            for (var qtyName in this.quantities) {
                if (this.quantities[qtyName].isTimeDependent) {
                    tdquantities[qtyName] = this.quantities[qtyName];
                }
            }

            return tdquantities;
        };

        // Exports all macros.
        return Compiler;
    });
