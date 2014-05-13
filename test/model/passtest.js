suite("pass.js", function() {
	// Template module.
	var pass;
	var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/pass"], function(assertModule, module) {
            console.log("Loaded 'pass' module.");
            assert = assertModule;
            pass = module;
            done();
        });
    });

	suite("pass", function() {
		test("parse() robustness", function() {
			assert.throws(
                function() {
                    pass.parse(null);
                });
            assert.throws(
                function() {
                    pass.parse();
                });
		});
	});
});