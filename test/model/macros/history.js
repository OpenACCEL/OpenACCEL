suite("History Macro", function() {
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
            fileLoader.load("history", "macros");
            macros = fileLoader.getMacros();
            done();
        });
    });

    suite("one level deep", function() {
        test("should expand for '__history__(exe.x(), 5)'", function() {
            var input = "__history__(exe.x(), 5)";
            var output = macroExpander.expand(input, macros);
            var expected =
            "(function () {"                                                                        +
            "\n    var historyValue = exe.x[exe.__time__ - 5];"                                     +
            "\n    if (historyValue === undefined) {"                                               +
            "\n        return 0;"                                                                   +
            "\n    } else {"                                                                        +
            "\n        return historyValue;"                                                        +
            "\n    }"                                                                               +
            "\n}());";
            assert.equal(output, expected);
        });

        test("should expand for '__history__(exe.x(), sin(5) - 3)'", function() {
            var input = "__history__(exe.x(), sin(5) - 3)";
            var output = macroExpander.expand(input, macros);
            var expected =
            "(function () {"                                                                        +
            "\n    var historyValue = exe.x[exe.__time__ - (sin(5) - 3)];"                          +
            "\n    if (historyValue === undefined) {"                                               +
            "\n        return 0;"                                                                   +
            "\n    } else {"                                                                        +
            "\n        return historyValue;"                                                        +
            "\n    }"                                                                               +
            "\n}());";
            assert.equal(output, expected);
        });
    });
});
