suite("Sin Macro", function() {
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
            fileLoader.load("sin");
            macros = fileLoader.getMacros();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = 5'", function() {
            var input = "exe = {};func(y = sin(5))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.sin(5), eval(output)());
        });

        test("should expand for 'x = 5, y = x + 2, z = sin(sin(x) + sin(y))'", function() {
            var input = "exe = {};func(x = 5)func(y = sin(exe.x()) + 2)func(z = sin(sin(exe.x()) + sin(exe.y())))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.sin(Math.sin(5) + Math.sin(Math.sin(5) + 2)), eval(output)());
        });
    });
});
