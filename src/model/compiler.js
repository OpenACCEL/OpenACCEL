/*
 * Central compiling point. Code goes in, executable and report go out.
 *
 * @author Roy Stoof
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
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
        "model/preprocessor",
        "model/macroexpander",
        "underscore"
    ], /**@lends Model*/
    function(FileLoader,
        PreProcessor,
        MacroExpander,
        _) {
        /**
         * @class
         * @classdesc The compiler takes code as input, and outputs an executable and report when compiling.
         */
        function Compiler() {
            /**
             * The pre-processor performs passes on the code for analysis purposes, as well as making it ready for the macroExpander.
             */
            this.preProcessor = new PreProcessor();

            /**
             * The macro expander will expand all macros, such that the code can be eval()'d.
             */
            this.macroExpander = new MacroExpander();

            /**
             * The file loader is reponsible for loading all files, like macros and library functions.
             */
            this.fileLoader = new FileLoader();
            this.fileLoader.load("func");
            this.fileLoader.load("operators");
            this.fileLoader.load("cond");
            this.fileLoader.load("history");

            this.fileLoader.load("map", "library");
            this.fileLoader.load("zip", "library");
            this.fileLoader.load("nzip", "library");

            this.fileLoader.load("add", "library");
            this.fileLoader.load("subtract", "library");
            this.fileLoader.load("multiply", "library");
            this.fileLoader.load("divide", "library");

            this.fileLoader.load("sin", "library");
            this.fileLoader.load("cos", "library");
            this.fileLoader.load("tan", "library");
            this.fileLoader.load("pow", "library");
            this.fileLoader.load("sqrt", "library");
            this.fileLoader.load("abs", "library");
            this.fileLoader.load("ceil", "library");
            this.fileLoader.load("floor", "library");
            this.fileLoader.load("round", "library");
            this.fileLoader.load("max", "library");
            this.fileLoader.load("min", "library");
            this.fileLoader.load("acos", "library");
            this.fileLoader.load("asin", "library");
            this.fileLoader.load("atan", "library");
            this.fileLoader.load("atan2", "library");
            this.fileLoader.load("exp", "library");
            this.fileLoader.load("ln", "library");
            this.fileLoader.load("log", "library");
            this.fileLoader.load("modulo", "library");
            this.fileLoader.load("sum", "library");

            this.fileLoader.load("random", "library");
            this.fileLoader.load("__if__", "library");

            this.fileLoader.load("and", "library");
            this.fileLoader.load("equal", "library");
            this.fileLoader.load("greaterThan", "library");
            this.fileLoader.load("greaterThanEqual", "library");
            this.fileLoader.load("imply", "library");
            this.fileLoader.load("lessThan", "library");
            this.fileLoader.load("lessThanEqual", "library");
            this.fileLoader.load("not", "library");
            this.fileLoader.load("notEqual", "library");
            this.fileLoader.load("or", "library");

            /**
             * Contains the quantities for which the history has been checked
             */
            this.historyChecked = [];

            /**
             * The total number of quantities in the script being compiled.
             */
            this.totalNumQuantities = 0;
        }

        /**
         * Compiles a piece of ACCEL code and outputs an object, containing an executable.
         *
         * @param {Script} script   The ACCEL script to be compiled.
         * @return {Object}         An object, containing an executable and information.
         */
        Compiler.prototype.compile = function(script) {
            // Determine all time-dependent quantities
            this.determineTimeDependencies(script.getQuantities());

            // Pre-process and expand.
            var code = this.preProcessor.process(script);
            code = this.fileLoader.getLibrary() + code;
            code = this.macroExpander.expand(code, this.fileLoader.getMacros());
            
            exe = eval(code);
            exe.__report__ = script.getQuantities();

            return {
                report: script.getQuantities(),
                exe: exe
            };
        };

        /**
         * Flags all time-dependent quantities as such
         *
         * @param quantities The set of quantities to analyse.
         */
        Compiler.prototype.determineTimeDependencies = function(quantities) {
            this.historyChecked = [];
            this.totalNumQuantities = _.size(quantities);

            var historyQuantities = this.getTimeDependentQuantities(quantities);
            for (var qty in historyQuantities) {
                this.setTimeDependent(historyQuantities[qty], true, quantities);
            }
        };

        /**
         * Recursively sets whether the given quantity, and all quantities depending on it,
         * are time-dependent. 
         *
         * @param {Quantity} quantity The quantity to use as starting point. All of it's reverse dependencies, if any, are checked recursively.
         * @param {Boolean} timeDependent Whether to mark quantity and it's reverse dependencies as time dependent or not.
         */
        Compiler.prototype.setTimeDependent = function(quantity, timeDependent, quantities) {
            // Base case: if all quantities have been checked
            if (_.size(this.historyChecked) == this.totalNumQuantities || quantity.name in this.historyChecked) {
                return;
            }

            quantity.isTimeDependent = timeDependent;
            for (var dep in quantity.reverseDeps) {
                this.determineTimeDependencies(quantities[quantity.reverseDeps[dep]], timeDependent);
            }

            this.historyChecked.push(quantity.name);
        };

        /**
         * Returns all quantities in the given set marked as time-dependent right now.
         *
         * @param quantities The set of quantities out of which to extract all time-
         * dependent quantities
         * @return A map of all time-dependent quantities in quantities, keyed by quantity
         * name.
         */
        Compiler.prototype.getTimeDependentQuantities = function(quantities) {
            var tdquantities = {};

            for (var qtyName in quantities) {
                if (quantities[qtyName].isTimeDependent) {
                    tdquantities[qtyName] = quantities[qtyName];
                }
            }

            return tdquantities;
        };

        // Exports all macros.
        return Compiler;
    });
