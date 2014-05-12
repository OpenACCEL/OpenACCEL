requirejs = require("requirejs");

suite("template.js", function() {
	// Template module.
	var template;
	var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "../../../src/template"], function(assertModule, module) {
            console.log("Loaded 'Template' module.");
            assert = assertModule;
            template = module;
            done();
        });
    });

	suite("sweet compilation", function() {
		test("should equal 6", function() {
			assert.equal(6, template.compile());
		});
	});
});