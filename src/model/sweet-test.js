/**
 * We have two environments: the browser and Node. If we are in the browser we should use requirejs and call our functions that way.
 * If we are in node, we should not and instead should just export the various modules for testing purpose.
 *
 * @author Roy Stoof
 */

// Detect whether we are in the browser and should invoke a function when all required modules are loaded.
inBrowser = typeof window !== 'undefined';
inNode    = !inBrowser;

if (inBrowser) {
    requirejs.config({
        shim: {
            'underscore': {
                exports: '_'
            }
        }
    });

    require(["sweet", "jquery"], function(sweet) {
        SweetTests.compile(sweet);
    });
}

/**
 * @class Various sweet testing functions.
 */
var SweetTests = {
        /**
         * Main and testable compilation function.
         * 
         * @param sweet A possible reference to the sweet library.
         * @return Returns the number 6 if compilation and execution of the code with Sweet.js macro has all been succesful.
         */
        compile: function(sweet) {
        // Try to load sweet if undefined.
        if (sweet === undefined) {
            var sweet = require("sweet.js");
        }

        if (inBrowser) {
            var compileWithSourcemap = $("body").attr("data-sourcemap") === "true";
        }

        var code = "macro add { rule { ($x) } => { $x + 1 } } (function() { var test = function() { return add(5); }; x = {}; x.test1 = test; return x; })();";
        var compiled;

        try {
            if (compileWithSourcemap) {
                compiled = sweet.compile(code, {
                    sourceMap: false,
                    readableNames: true
                });
            } else {
                compiled = sweet.compile(code, {
                    sourceMap: false,
                    readableNames: true
                });
            }

            var toEval = compiled.code;
            myEval = eval(toEval);
            var answer = myEval.test1();
            if (inBrowser) {
                $("#output").text(answer);
            }
            return answer;
        } catch (err) {
            
        }
    }
}

// Node.js exports.
if (inNode) {
    exports.compile = SweetTests.compile;
}
var dummy2;

/**
 * @class
 * @classdesc Super duper class
 */
var MyClass = function() {
    /**
     * Some inner var
     * @type {Number}
     */
    var x;

    /**
     * Some constant
     * @const
     * @type {Number}
     */
    const Q = 38;

    /**
     * Some fancy thing
     * @pre a
     * @pre b
     * @post c
     * @param  {Number} a aaaaaaa
     * @param  {Number} b bbbbbbb
     * @return {Number}   something
     */
    function somefunction(a,b)
    {

    }


    /**
     * Some other fancy thing
     * @post c
     * @param  {Number} a aaaaaaa
     * @param  {Number} b bbbbbbb
     * @return {String}   something else
     * @throws {DummyException} Help
     */
    function somefunction2(a,b)
    {

    }
};

/**
    
}