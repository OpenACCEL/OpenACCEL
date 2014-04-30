/**
 * @author Blah
 */

requirejs.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

require(["sweet", "jquery"], function(sweet) {
    var compileWithSourcemap = $("body").attr("data-sourcemap") === "true";
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
        $("#output").text(answer);
    } catch (err) {
        
    }
});

/**
 * Dummy function
 * @return {Number} Roy
 */
function dummy()
{}