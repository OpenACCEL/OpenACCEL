suite("Modulo Library", function() {
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
            fileLoader.load("modulo", "library");
            fileLoader.load("zip", "library");
            macros = fileLoader.getContent();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = modulo(5,4)'", function() {
            var input = "exe = {};func(y = modulo(5, 4))";
            var output = macroExpander.expand(input, macros);
            assert.equal(5 % 4, eval(output)());
        });

        test("should expand for 'x = 5, y = modulo(x,4) + 2, z = modulo(modulo(x,2),y)'", function() {
            var input = "exe = {};func(x = 5)func(y = modulo(exe.x(),4) + 2)func(z = modulo(modulo(exe.x(), 2), exe.y()))";
            var output = macroExpander.expand(input, macros);
            assert.equal((5 % 2) % (5 % 4 + 2), eval(output)());
        });
    });
});
