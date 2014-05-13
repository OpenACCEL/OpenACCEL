suite("Sin Macro", function() {
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
            macroExpander.load("sin");
            var input = "exe = {};func(y = sin(5))";
            var output = macroExpander.compile(input);
            assert.equal(Math.sin(5), eval(output)());
        });

        test("should expand for 'x = 5, y = x + 2, z = sin(sin(x) + sin(y))'", function() {
            macroExpander.load("func");
            macroExpander.load("sin");
            var input = "exe = {};func(x = 5)func(y = sin(exe.x()) + 2)func(z = sin(sin(exe.x()) + sin(exe.y())))";
            var output = macroExpander.compile(input);
            assert.equal(Math.sin(Math.sin(5) + Math.sin(Math.sin(5) + 2)), eval(output)());
        });
    });
});