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
	// The browser needs to know that underscore can be used as _.
    requirejs.config({
        shim: {
            'underscore': {
                exports: '_'
            }
        }
    });

    // If all requirements are loaded, we may execute a main function.
    require(["sweet", "jquery"], function(sweet) {
        TemplateClass.compile(sweet);
    });
} else {
	// Possible Node dependant header code.
}

/**
 * @class
 * @classdesc Classes can be defined as objects. Indiciate this using the @class param.
 */
var TemplateClass = {
        /**
         * Main and testable compilation function.
         * 
         * @param sweet A possible reference to the sweet library.
         * @return Returns the number 6 if compilation and execution of the code with Sweet.js macro has all been succesful.
         */
        compile: function(sweet) {
	        // Try to load sweet if undefined.
	        if (inBrowser) {
	            var compileWithSourcemap = $("body").attr("data-sourcemap") === "true";
	        } else if (sweet === undefined) {
	        	var sweet = require("sweet.js");
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
	            return -1;
        }
    }
}

// Exports are needed in Node, such that other modules may invoke methods from this module file.
if (inNode) {
    exports.compile = TemplateClass.compile;
}