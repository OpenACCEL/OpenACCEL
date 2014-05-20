suite("Max Library", function() {
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
            fileLoader.load("max", "library");
            macros = fileLoader.getContent();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = max(5, 2, 3, 7, 1, 0, -8)'", function() {
            var input = "exe = {};func(y = max(5, 2, 3, 7, 1, 0, -8))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.max(5, 2, 3, 7, 1, 0, -8), eval(output)());
        });

        test("should expand for 'x = 5, y = max(x,4) + 2, z = max(max(x,2),y)'", function() {
            var input = "exe = {};func(x = 5)func(y = max(exe.x(),4) + 2)func(z = max(max(exe.x(), 2), exe.y()))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.max(Math.max(5, 2), Math.max(5, 4) + 2), eval(output)());
        });
    });
});
