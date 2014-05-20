suite("Tan Library", function() {
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
            fileLoader.load("func");
            fileLoader.load("tan", "library");
            macros = fileLoader.getContent();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = 5'", function() {
            var input = "exe = {};func(y = tan(5))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.tan(5), eval(output)());
        });

        test("should expand for 'x = 5, y = x + 2, z = tan(tan(x) + tan(y))'", function() {
            var input = "exe = {};func(x = 5)func(y = tan(exe.x()) + 2)func(z = tan(tan(exe.x()) + tan(exe.y())))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.tan(Math.tan(5) + Math.tan(Math.tan(5) + 2)), eval(output)());
        });
    });
});