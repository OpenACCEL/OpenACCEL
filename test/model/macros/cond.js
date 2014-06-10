suite("Cond Macro", function() {

    var assert;
    var compiler;
    var macroExpander;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/macroexpander", "model/compiler", "model/script"], function(Assert, MacroExpander, Compiler, Script) {
            console.log("Loaded 'Cond' module.");
            assert = Assert;
            macroExpander = new MacroExpander();
            compiler = new Compiler();
            script = Script;
            done();
        });
    });

    suite("Results through compiler", function() {
        test("Simple expression, false", function() {
            var input = "x = cond(1 > 2, 3, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.__x__(), 4);
        });

        test("Simple expression, true", function() {
            var input = "x = cond(1 < 2, 3, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.__x__(), 3);
        });

        test("Custom max function", function() {
            var input = "f(x,y) = cond(x > y, x, y)\n" +
                "a = 20\n" +
                "b = 40\n" +
                "c = f(a,b)";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.__c__(), 40);
        });

        test("Nested cond", function() {
            var input = "x = cond(1 == 2, cond(1 < 2, 3, 4), cond(2 > 1, 5, 6))";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.__x__(), 5);
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
