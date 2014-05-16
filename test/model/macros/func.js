suite("Func Macro", function() {
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

    suite("variables", function() {
        test("should expand for 'x = 5'", function() {
            macroExpander.load("func");
            var input = "func(x = 5)";
            var output = macroExpander.expand(input);
            var expected = "exe.x = function () {\n    return 5;\n};";
            assert.equal(expected, output);
        });

        test("should expand for 'func(z = 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))'", function() {
            macroExpander.load("func");
            var input = "func(z = 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))";
            var output = macroExpander.expand(input);
            var expected = "exe.z = function () {\n    return 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2);\n};";
            assert.equal(expected, output);
        });
    });

    suite("user-defined functions", function() {
        test("should expand for 'x(a, b) = 5'", function() {
            macroExpander.load("func");
            var input = "func(x(a, b) = 5)";
            var output = macroExpander.expand(input);
            var expected = "exe.x = function (a, b) {\n    return 5;\n};";
            assert.equal(expected, output);
        });

        test("should expand for 'func(z(a, b) = a + 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))'", function() {
            macroExpander.load("func");
            var input = "func(z(a, b) = a + 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))";
            var output = macroExpander.expand(input);
            var expected = "exe.z = function (a, b) {\n    return a + 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2);\n};";
            assert.equal(expected, output);
        });
    });
});
