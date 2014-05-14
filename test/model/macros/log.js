suite("Log Macro", function() {
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
        test("should expand for 'x = log(5)'", function() {
            macroExpander.load("func");
            macroExpander.load("log");
            var input = "exe = {};func(y = log(5))";
            var output = macroExpander.expand(input);
            assert.equal(Math.log(5) / Math.log(10), eval(output)());
        });

        test("should expand for 'x = 5, y = log(x) + 2, z = log(log(x) + log(y))'", function() {
            macroExpander.load("func");
            macroExpander.load("log");
            var input = "exe = {};func(x = 5)func(y = log(exe.x()) + 2)func(z = log(log(exe.x()) + log(exe.y())))";
            var output = macroExpander.expand(input);
            assert.equal(Math.log(Math.log(5) / Math.log(10) + Math.log(Math.log(5) / Math.log(10) + 2) / Math.log(10)) / Math.log(10), eval(output)());
        });
    });
});