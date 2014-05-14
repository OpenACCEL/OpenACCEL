/*
 * We have two environments: the browser and Node. If we are in the browser we should use requirejs and call our functions that way.
 * If we are in node, we should not and instead should just export the various modules for testing purpose.
 *
 * @author Roy Stoof
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode    = !inBrowser;

if (inNode) { 
    require = require('requirejs');
    sweetModule = "sweet.js";
} else {
    sweetModule = "sweet";
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define([sweetModule, "jquery"], /**@lends TemplateClass*/ function(sweet) {
    /**
     * @class
     * @classdesc Classes can be defined as objects. Indiciate this using the @class param.
     */
    function TemplateClass() {
        this.myMember = 5;
    }

    TemplateClass.prototype = {
        /**
         * Main and testable compilation function.
         * 
         * @param sweet A possible reference to the sweet library.
         * @return Returns the number 6 if compilation and execution of the code with Sweet.js macro has all been succesful.
         */
        compile: function() {
            // Try to load sweet if undefined.
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
                return -1;
            }
        }
    }

    // If we are in the browser, we want to execute the compile function at the start.
    if (inBrowser) {
        var tc = new TemplateClass();
        tc.compile();
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return TemplateClass;
});