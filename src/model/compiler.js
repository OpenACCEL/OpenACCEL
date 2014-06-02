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
             * All the quantities in the script to be compiled.
             *
             * @type {Map<String, Quantity>}
             */
            this.quantities = null;

            /**
             * The file loader is reponsible for loading all files, like macros and library functions.
             */
            this.fileLoader = new FileLoader();

            this.fileLoader.load("cond", "macros");
            this.fileLoader.load("func", "macros");
            this.fileLoader.load("operators", "macros");
            this.fileLoader.load("history", "macros");

            this.fileLoader.load("functions", "library");

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
            this.quantities = script.getQuantities();

            // Determine all time-dependent quantities
            this.determineTimeDependencies();

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
