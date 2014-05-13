suite("Tan Macro", function() {
    var macroExpander;
    var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/macroexpander"], function(assertModule, module) {
            console.log("Loaded 'MacroExpander' module.");
            assert = assertModule;
            macroExpander = new module();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = 5'", function() {
            macroExpander.load("func");
            macroExpander.load("tan");
            var input = "exe = {};func(y = tan(5))";
            var output = macroExpander.compile(input);
            assert.equal(Math.tan(5), eval(output)());
        });

        test("should expand for 'x = 5, y = x + 2, z = tan(tan(x) + tan(y))'", function() {
            macroExpander.load("func");
            macroExpander.load("tan");
            var input = "exe = {};func(x = 5)func(y = tan(exe.x()) + 2)func(z = tan(tan(exe.x()) + tan(exe.y())))";
            var output = macroExpander.compile(input);
            assert.equal(Math.tan(Math.tan(5) + Math.tan(Math.tan(5) + 2)), eval(output)());
        });
    });
});