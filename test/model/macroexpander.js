suite("Macro Expander", function() {
    var macroExpander;
    var fileLoader;
    var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/macroexpander", "model/fileloader"], function(assertModule, module, FileLoader) {
            console.log("Loaded 'MacroExpander' module.");
            assert = assertModule;
            macroExpander = new module();
            fileLoader = new FileLoader();
            done();
        });
    });

    suite("pure sweet compilation", function() {
        test("should equal 6", function() {
            var macros = "macro add { rule { ($x) } => { $x + 1 } }";
            var code = "(function() { var test = function() { return add(5); }; x = {}; x.test1 = test; return x; })();";
            var output = eval(macroExpander.expand(code, macros));
            assert.equal(6, output.test1());
        });

        test("should equal 6", function() {
            var code = "(function() { var test = function() { return add(5); }; x = {}; x.test1 = test; return x; })();";
            fileLoader.load("testAdd", "macros");
            var output = eval(macroExpander.expand(code, fileLoader.getMacros()));
            assert.equal(6, output.test1());
        });
    });
});
