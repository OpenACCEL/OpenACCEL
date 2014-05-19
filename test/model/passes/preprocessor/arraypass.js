suite("ArrayPass.js", function() {
    // Template module.
    var ArrayPass;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/passes/preprocessor/ArrayPass"], function(assertModule, module) {
            console.log("Loaded 'ArrayPass' module.");
            assert = assertModule;
            ArrayPass = new module();
            done();
        });
    });

    suite("ArrayPass", function() {


        test("parse() robustness", function() {
            assert.throws(
                function() {
                    ArrayPass.parse(null);
                });
            assert.throws(
                function() {
                    ArrayPass.parse();
                });
        });

        
    });
});
