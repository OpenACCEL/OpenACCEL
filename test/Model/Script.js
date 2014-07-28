suite("Script", function() {

    var assert;
    var Script;

    setup(function(done) {
        requirejs(["assert", "Model/Script"], function(Assert, scriptModule) {
            assert = Assert;
            Script = scriptModule;
            done();
        });
    });

    suite("| Is Complete?", function() {
        /**
         * Simple script that should be complete.
         *
         * @input:      x = b
         *              b = 4
         * @expected:   isComplete() == true.
         */
        test("| Simple complete script", function() {
            var code = "x = b \n b=4";
            var script = new Script(code);
            var output = script.isComplete();
            var expected = true;
            assert.equal(output, expected);
        });

        /**
         * An undefined variable should mean that the script is not yet complete.
         * 
         * @input:      x = b
         * @expected:   isComplete() == false.
         */
        test("| Undefined variable", function() {
            var code = "x = b";
            var script = new Script(code);
            var output = script.isComplete();
            var expected = false;
            assert.equal(output, expected);
        });

        /**
         * Empty scripts should not be complete by definition.
         *
         * @input: -
         * @expected: isComplete() == false.
         */
        test("| Empty script", function() {
            var script = new Script();
            var output = script.isComplete();
            var expected = false;
            assert.equal(output, expected);
        });

        /**
         * When a script becomes empty after not being empty, is should not be complete.
         */
        test("| Script empty after deleting quantities", function() {
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
