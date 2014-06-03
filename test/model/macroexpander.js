suite("Macro Expander", function() {

    var assert;
    var fileLoader;
    var macroExpander;

    setup(function (done) {
        requirejs(["assert", "model/macroexpander", "model/fileloader"], function(Assert, MacroExpander, FileLoader) {
            console.log("Loaded 'MacroExpander' module.");
            assert = Assert;
            macroExpander = new MacroExpander();
            fileLoader = new FileLoader();
            fileLoader.load("testAdd", "macros");
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
            var output = eval(macroExpander.expand(code, fileLoader.getMacros()));
            assert.equal(6, output.test1());
        });
    });
});
