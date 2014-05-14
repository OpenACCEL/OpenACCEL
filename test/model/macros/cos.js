suite("Cos Macro", function() {
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
            macroExpander.load("cos");
            var input = "exe = {};func(y = cos(5))";
            var output = macroExpander.expand(input);
            assert.equal(Math.cos(5), eval(output)());
        });

        test("should expand for 'x = 5, y = x + 2, z = cos(cos(x) + cos(y))'", function() {
            macroExpander.load("func");
            macroExpander.load("cos");
            var input = "exe = {};func(x = 5)func(y = cos(exe.x()) + 2)func(z = cos(cos(exe.x()) + cos(exe.y())))";
            var output = macroExpander.expand(input);
            assert.equal(Math.cos(Math.cos(5) + Math.cos(Math.cos(5) + 2)), eval(output)());
        });
    });
});