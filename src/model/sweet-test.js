/**
 * @author Roy Stoof
 *
 * We have two environemnts: the browser and Node. If we are in the browser we should use requirejs and call our functions that way.
 * If we are in node, we should not and instead should just export the various modules for testing purpose.
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
        compile(sweet);
    });
}

/**
 * Main and testable compilation function.
 * 
 * @param sweet A possible reference to the sweet library.
 * @return Returns the number 6 if compilation and execution of the code with Sweet.js macro has all been succesful.
 */
var compile = function(sweet) {
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

// Node.js exports.
if (inNode) {
    exports.compile = compile;
}