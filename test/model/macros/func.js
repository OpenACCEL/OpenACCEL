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

	suite("expansion", function() {
		test("should expand for 'x = 5'", function() {
            macroExpander.load("func");
			var input = "func(x = 5)";
			var output = macroExpander.compile(input);
            var expected = "x = function () {\n    return 5;\n};\nexe.x = x;";
			assert.equal(expected, output);
		});

        test("should expand for 'func(z = 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))'", function() {
            macroExpander.load("func");
            var input = "func(z = 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2))";
            var output = macroExpander.compile(input);
            var expected = "var z = function () {\n    return 2 + sin(exe.y() + sin(exe.x())) + 4 + sin(2);\n};\nexe.z = z;";
            assert.equal(expected, output);
        });
	});
});