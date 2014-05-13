suite("Macro Loader", function() {
	var macroLoader;
	var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/macroloader"], function(assertModule, module) {
            console.log("Loaded 'MacroLoader' module.");
            assert = assertModule;
            macroLoader = module;
            done();
        });
    });

	suite("Test loading of macro files.", function() {
		test("should equal true", function() {
			assert.equal(true, macroLoader.load("func"));
		});
	});
});