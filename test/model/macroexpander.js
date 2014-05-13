suite("Macro Expander", function() {
	var macroExpander;
	var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/macroexpander"], function(assertModule, module) {
            console.log("Loaded 'MacroExpander' module.");
            assert = assertModule;
            macroExpander = module;
            done();
        });
    });

	suite("Test pure sweet compilation.", function() {
		test("should equal 6", function() {
			var code = code = "macro add { rule { ($x) } => { $x + 1 } } (function() { var test = function() { return add(5); }; x = {}; x.test1 = test; return x; })();";
			var output = eval(macroExpander.compile(code));
			assert.equal(6, output.test1());
		});
	});
});