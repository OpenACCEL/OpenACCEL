suite("Max Macro", function() {
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
        test("should expand for 'x = max(5, 2, 3, 7, 1, 0, -8)'", function() {
            macroExpander.load("func");
            macroExpander.load("max");
            var input = "exe = {};func(y = max(5, 2, 3, 7, 1, 0, -8))";
            var output = macroExpander.compile(input);
            assert.equal(Math.max(5, 2, 3, 7, 1, 0, -8), eval(output)());
        });

        test("should expand for 'x = 5, y = max(x,4) + 2, z = max(max(x,2),y)'", function() {
            macroExpander.load("func");
            macroExpander.load("max");
            var input = "exe = {};func(x = 5)func(y = max(x,4) + 2)func(z = max(max(exe.x(), 2), exe.y()))";
            var output = macroExpander.compile(input);
            assert.equal(Math.max(Math.max(5, 2), max(x, 4) + 2), eval(output)());
        });
    });
});