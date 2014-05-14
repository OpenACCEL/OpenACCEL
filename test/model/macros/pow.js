suite("Pow Macro", function() {
    var macroExpander;
    var assert;

    setup(function(done) {
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
        test("should expand for 'x = pow(5,2)'", function() {
            macroExpander.load("func");
            macroExpander.load("pow");
            var input = "exe = {};func(x = pow(5, 2))";
            var output = macroExpander.compile(input);
            assert.equal(Math.pow(5, 2), eval(output)());
        });

        test("should expand for 'x = 5, y = pow(x, 3), z = pow(y, pow(x,2))'", function() {
            macroExpander.load("func");
            macroExpander.load("pow");
            var input = "exe = {};func(x = 5)func(y = pow(exe.x(), 3))func(z = pow(exe.y(), pow(exe.x(), 2)))";
            var output = macroExpander.compile(input);
            assert.equal(Math.pow(Math.pow(x, 3), Math.pow(5, 2)), eval(output)());
        });
    });
});