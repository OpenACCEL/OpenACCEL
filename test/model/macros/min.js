suite("Min Macro", function() {
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
        test("should expand for 'x = min(5, 2, 3, 7, 1, 0, -8)'", function() {
            macroExpander.load("func");
            macroExpander.load("min");
            var input = "exe = {};func(y = min(5, 2, 3, 7, 1, 0, -8))";
            var output = macroExpander.expand(input);
            assert.equal(Math.min(5, 2, 3, 7, 1, 0, -8), eval(output)());
        });

        test("should expand for 'x = 5, y = min(x,4) + 2, z = min(min(x,2),y)'", function() {
            macroExpander.load("func");
            macroExpander.load("min");
            var input = "exe = {};func(x = 5)func(y = min(x,4) + 2)func(z = min(min(exe.x(), 2), exe.y()))";
            var output = macroExpander.expand(input);
            assert.equal(Math.min(Math.min(5, 2), Math.min(x, 4) + 2), eval(output)());
        });
    });
});