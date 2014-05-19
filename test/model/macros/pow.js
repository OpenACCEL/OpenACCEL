suite("Pow Macro", function() {
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
            fileLoader.load("pow");
            macros = fileLoader.getMacros();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = pow(5,2)'", function() {
            var input = "exe = {};func(x = pow(5, 2))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.pow(5, 2), eval(output)());
        });

        test("should expand for 'x = 5, y = pow(x, 3), z = pow(y, pow(x,2))'", function() {
            var input = "exe = {};func(x = 5)func(y = pow(exe.x(), 3))func(z = pow(exe.y(), pow(exe.x(), 2)))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.pow(Math.pow(5, 3), Math.pow(5, 2)), eval(output)());
        });
    });
});
