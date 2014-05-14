suite("Atan2 Macro", function() {
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
        test("should expand for 'x = atan2(1,1)'", function() {
            macroExpander.load("func");
            macroExpander.load("atan2");
            var input = "exe = {};func(y = atan2(1,1))";
            var output = macroExpander.compile(input);
            assert.equal(Math.atan2(1, 1), eval(output)());
        });

        test("should expand for 'x = 5, y = atan2(x, 7) + 2, z = atan2(3, atan2(x, y))'", function() {
            macroExpander.load("func");
            macroExpander.load("atan2");
            var input = "exe = {};func(x = 5)func(y = atan2(exe.x(), 7) + 2)func(z = atan2(3, atan2(exe.x(), exe.y())))";
            var output = macroExpander.compile(input);
            assert.equal(Math.atan2(3, Math.atan2(5, Math.atan2(5, 7))), eval(output)());
        });
    });
});