suite("funcpass.js", function() {
	// Template module.
	var funcpass;
	var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/funcpass"], function(assertModule, module) {
            console.log("Loaded 'funcpass' module.");
            assert = assertModule;
            funcpass = new module();
            done();
        });
    });

	suite("funcpass", function() {


		test("parse() robustness", function() {
			assert.throws(
                function() {
                    funcpass.parse(null);
                });
            assert.throws(
                function() {
                    funcpass.parse();
                });
		});
	});
});