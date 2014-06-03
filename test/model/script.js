suite("Script", function() {
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/script"], function(assertModule, module) {
            console.log("Loaded 'Compiler' module.");
            assert = assertModule;
            Script = module;
            done();
        });
    });

    suite("isComplete()", function() {
        test("Script complete", function() {
            var code = "x = b \n b=4";
            var script = new Script(code);
            var output = script.isComplete();
            var expected = true;
            assert.equal(output, expected);
        });

        test("Undefined variable", function() {
            var code = "x = b";
            var script = new Script(code);
            var output = script.isComplete();
            var expected = false;
            assert.equal(output, expected);
        });

        test("Empty script", function() {
            var script = new Script();
            var output = script.isComplete();
            var expected = false;
            assert.equal(output, expected);
        });

        test("Script empty after deleting quantities", function() {
            var code = "x = b \n b=e+f\n e=3 \n f=6";
            var script = new Script(code);

            script.deleteQuantity("b");
            script.deleteQuantity("x");
            script.deleteQuantity("e");
            script.deleteQuantity("f");

            var output = script.isComplete();
            var expected = false;
            assert.equal(output, expected);
        });
    });
});
