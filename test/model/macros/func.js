suite("Func Macro", function() {
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
            macros = fileLoader.getMacros();
            done();
        });
    });

    suite("variables", function() {
        test("should expand for 'x = 5'", function() {
            var input = "func(x = 5)";
            var output = macroExpander.expand(input, macros);
            var expected =
            "exe.x = function () {"                                                                 +
            "\n    // If a quantity is time dependant, look up if there exists a previous version." +
            "\n    if (true) {"                       +
            "\n        if (exe.x[exe.__time__] === undefined) {"                                    +
            "\n            exe.x[exe.__time__] = 5;"                                                +
            "\n        }"                                                                           +
            "\n        return exe.x[exe.__time__];"                                                 +
            "\n    } else {"                                                                        +
            "\n        if (exe.x[0] === undefined) {"                                               +
            "\n            exe.x[0] = 5;"                                                           +
            "\n        }"                                                                           +
            "\n        return exe.x[0];"                                                            +
            "\n    }"                                                                               +
            "\n};";
            assert.equal(output, expected);
        });

        test("should expand for 'func(z = 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))'", function() {
            var input = "func(z = 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))";
            var output = macroExpander.expand(input, macros);
            var expected =
            "exe.z = function () {"                                                                 +
            "\n    // If a quantity is time dependant, look up if there exists a previous version." +
            "\n    if (true) {"                       +
            "\n        if (exe.z[exe.__time__] === undefined) {"                                    +
            "\n            exe.z[exe.__time__] = 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2);"     +
            "\n        }"                                                                           +
            "\n        return exe.z[exe.__time__];"                                                 +
            "\n    } else {"                                                                        +
            "\n        if (exe.z[0] === undefined) {"                                               +
            "\n            exe.z[0] = 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2);"                +
            "\n        }"                                                                           +
            "\n        return exe.z[0];"                                                            +
            "\n    }"                                                                               +
            "\n};";
            assert.equal(output, expected);
        });
    });

    suite("user-defined functions", function() {
        test("should expand for 'x(a, b) = 5'", function() {
            var input = "func(x(a, b) = 5)";
            var output = macroExpander.expand(input, macros);
            var expected =
            "exe.x = function (a, b) {"                                                             +
            "\n    // If a quantity is time dependant, look up if there exists a previous version." +
            "\n    if (true) {"                       +
            "\n        if (exe.x[exe.__time__] === undefined) {"                                    +
            "\n            exe.x[exe.__time__] = 5;"                                                +
            "\n        }"                                                                           +
            "\n        return exe.x[exe.__time__];"                                                 +
            "\n    } else {"                                                                        +
            "\n        if (exe.x[0] === undefined) {"                                               +
            "\n            exe.x[0] = 5;"                                                           +
            "\n        }"                                                                           +
            "\n        return exe.x[0];"                                                            +
            "\n    }"                                                                               +
            "\n};";
            assert.equal(output, expected);
        });

        test("should expand for 'func(z(a, b) = a + 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))'", function() {
            var input = "func(z(a, b) = a + 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))";
            var output = macroExpander.expand(input, macros);
            var expected =
            "exe.z = function (a, b) {"                                                             +
            "\n    // If a quantity is time dependant, look up if there exists a previous version." +
            "\n    if (true) {"                       +
            "\n        if (exe.z[exe.__time__] === undefined) {"                                    +
            "\n            exe.z[exe.__time__] = a + 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2);" +
            "\n        }"                                                                           +
            "\n        return exe.z[exe.__time__];"                                                 +
            "\n    } else {"                                                                        +
            "\n        if (exe.z[0] === undefined) {"                                               +
            "\n            exe.z[0] = a + 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2);"            +
            "\n        }"                                                                           +
            "\n        return exe.z[0];"                                                            +
            "\n    }"                                                                               +
            "\n};";
            assert.equal(output, expected);
        });
    });
});
