suite("Cond Macro", function() {
    var macroExpander;
    var assert;
    var compiler;
    var Script

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/macroexpander", "model/compiler", "model/script"], function(assertModule, MacroExpander, Compiler, scriptModule) {
            console.log("Loaded 'MacroExpander, FileLoader, Compiler and Script' module.");
            assert = assertModule;
            macroExpander = new MacroExpander();
            compiler = new Compiler;
            Script = scriptModule;
            done();
        });
    });

    suite("Results through compiler", function() {
        test("Simple expression, false", function() {
            var input = "x = cond(1 > 2, 3, 4)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.x(), 4);
        });

        test("Simple expression, true", function() {
            var input = "x = cond(1 < 2, 3, 4)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.x(), 3);
        });

        test("Custom max function", function() {
            var input = "f(x,y) = cond(x > y, x, y)\n" +
                "a = 20\n" +
                "b = 40\n" +
                "c = f(a,b)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.c(), 40);
        });

        test("Nested cond", function() {
            var input = "x = cond(1 == 2, cond(1 < 2, 3, 4), cond(2 > 1, 5, 6))";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.x(), 5);
        });
    });

    suite("Macro expansion", function() {
        test("should expand for 'x = cond(1 > 2, 3, 4)'", function() {
            var input = "x = cond(1 > 2, 3, 4)";
            var output = macroExpander.expand(input, compiler.fileLoader.getMacros());
            var expected = "x = 1 > 2 ? 3 : 4;";
            assert.equal(output, expected);
        });
    });
});
