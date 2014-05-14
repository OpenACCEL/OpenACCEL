suite("Macro Expander", function() {
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

    suite("pure sweet compilation", function() {
        test("should equal 6", function() {
            var code = "macro add { rule { ($x) } => { $x + 1 } } (function() { var test = function() { return add(5); }; x = {}; x.test1 = test; return x; })();";
            var output = eval(macroExpander.expand(code));
            assert.equal(6, output.test1());
        });

        test("should equal 6", function() {
            var code = "(function() { var test = function() { return add(5); }; x = {}; x.test1 = test; return x; })();";
            macroExpander.load("testAdd");
            var output = eval(macroExpander.expand(code));
            assert.equal(6, output.test1());
        });
    });
});