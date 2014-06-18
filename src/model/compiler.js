/*
 * Central compiling point. Code goes in, executable goes out.
 *
 * @author Roy Stoof
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

define(["model/fileloader",
        "model/macroexpander",
        "underscore",
        "model/parser",
        "model/exceptions/SyntaxError",
        "model/executable"
    ], /**@lends Model.Compiler */
    function(FileLoader,
        MacroExpander,
        _,
        parser,
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
             * The macro expander will expand all macros, such that the code can be eval()'d.
             */
            this.macroExpander = new MacroExpander();

            /**
             * The parser that will be used to parse inputted ACCEL code
             * and construct the executable from it.
             */
            this.parser = parser;

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
             * The file loader is reponsible for loading all files, like macros and library functions.
             */
            this.fileLoader = new FileLoader();

            this.fileLoader.load("cond", "macros");
            this.fileLoader.load("func", "macros");
            this.fileLoader.load("history", "macros");
            this.fileLoader.load("quantifier", "macros");

            this.fileLoader.load("functions", "library");
            eval.call(globalScope, this.fileLoader.getLibrary());
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

            // The code will be incrementally "build"/generated and each intermediate result will be stored
            // in this variable
            var code;

            // Parse the script with the lexical scanner + parser. Do this before checking e.g. the time dependencies
            // and setting user input values to make sure the script is valid first
            code = this.parse(script.getSource());

            // Determine all time-dependent quantities
            this.determineTimeDependencies();

            // Expand the macros in the parser-outputted code
            code = this.macroExpander.expand(code, this.fileLoader.getMacros());

            // Create Executable with the parsed code 
            exe = new Executable(code, script.getQuantities());

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
            // Base case: if all quantities have been checked
            if (this.historyChecked.indexOf(quantity.name) >= 0) {
                //console.log(quantity.name + " already checked");
                return;
            }

            quantity.isTimeDependent = timeDependent;
            this.historyChecked.push(quantity.name);
            //console.log ("Starting " + quantity.name);
            for (var dep in quantity.reverseDeps) {
                //console.log("Going to dependency " + this.quantities[quantity.reverseDeps[dep]].name);
                this.setTimeDependent(this.quantities[quantity.reverseDeps[dep]], timeDependent);
            }

            //console.log ("Finished " + quantity.name);
            //console.log ("History log: " + this.historyChecked);
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
