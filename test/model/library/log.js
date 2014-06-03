suite("Log Library", function() {
    var macroExpander;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/macroexpander", "model/fileloader"], function(assertModule, module, FileLoader) {
            console.log("Loaded 'MacroExpander & FileLoader' module.");
            assert = assertModule;
            macroExpander = new module();
            var fileLoader = new FileLoader();
            fileLoader.load("func", "macros");
            fileLoader.load("log", "library");
            macros = fileLoader.getContent();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = log(5)'", function() {
            var input = "exe = {};func(y = log(5))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.log(5) / Math.log(10), eval(output)());
        });

        test("should expand for 'x = 5, y = log(x) + 2, z = log(log(x) + log(y))'", function() {
            var input = "exe = {};func(x = 5)func(y = log(exe.x()) + 2)func(z = log(log(exe.x()) + log(exe.y())))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.log(Math.log(5) / Math.log(10) + Math.log(Math.log(5) / Math.log(10) + 2) / Math.log(10)) / Math.log(10), eval(output)());
        });
    });
});
