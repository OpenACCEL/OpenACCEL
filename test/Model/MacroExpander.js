suite("Macro Expander", function() {

    var assert;
    var fileLoader;
    var macroExpander;

    setup(function (done) {
        requirejs(["assert", "Model/MacroExpander", "Model/FileLoader"], function(Assert, MacroExpander, FileLoader) {
            assert = Assert;
            macroExpander = new MacroExpander();
            fileLoader = new FileLoader();
            fileLoader.load("testAdd", "testmacros");
            done();
        });
    });

    suite("| Compilation", function() {
        /**
         * Quick test to see if macro expansion works.
         */
        test("| Simple test macro", function() {
            var macros = "macro add { rule { ($x) } => { $x + 1 } }";
            var code = "(function() { var test = function() { return add(5); }; x = {}; x.test1 = test; return x; })();";
            var output = eval(macroExpander.expand(code, macros));
            assert.equal(6, output.test1());
        });

        /**
         * Quick test to see if macro expansion works with the file loader.
         */
        test("| Simple test macro with file loader", function() {
            var code = "(function() { var test = function() { return add(5); }; x = {}; x.test1 = test; return x; })();";
            var output = eval(macroExpander.expand(code, fileLoader.getMacros()));
            assert.equal(6, output.test1());
        });
    });
});
