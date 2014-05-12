requirejs = require("requirejs");

suite("PreProcessorTest.js", function() {
    // Template module.
    var preProcessor;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "../../../src/template"], function(assertModule, module) {
            console.log("Loaded 'Template' module.");
            assert = assertModule;
            preprocessor = module;
            done();
        });
    });

    suite("Pre Processor", function() {
        var exScript = "x = 5 \n" +
            "y = sin(x)" +
            "z = 2 + sin(y + sin(x)) + sin(2)" +
            "u = x + y";

        test("should equal 6", function() {
            assert.equal(6, preprocessor.compile());
        });
    });
});