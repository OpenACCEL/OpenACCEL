suite("exepass.js", function() {
    // Template module.
    var instance;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/exepass"], function(assertModule, module) {
            console.log("Loaded 'exepass' module.");
            assert = assertModule;
            instance = new module();
            done();
        });
    });

    suite("ExePass", function() {
        /**
         * Test case for parse()
         */
        test("parse", function() {
            var lines = [
                "x = 5 ; kg", // Constant assignment with unit
                "y = sin(x)", // simple function
                "z = 2 + sin(y + sin(x)) + sin(2)" // complex function
            ];
            var expResult = [
                "x = 5 ; kg",
                "y = sin(exe.x())",
                "z = 2 + sin(exe.y() + sin(exe.x())) + sin(2)"
            ];
            assert.deepEqual(instance.parse(lines), expResult);
        });


        /**
         * Test case for translateRHS().
         * Definition with function calls.
         */
        test("translateRHS():  Definition with function calls", function() {
            var line = "2 + sin(y + sin(x)) + sin(2)";
            var expResult = "2 + sin(exe.y() + sin(exe.x())) + sin(2)";

            assert.equal(instance.translateRHS(line), expResult);
        });

        /**
         * Test case for translateLine().
         * Robustness
         */
        test("translateRHS(): Robustness", function() {
            assert.throws(function() {
                instance.translateRHS(null);
            });
            assert.throws(function() {
                instance.translateRHS();
            });
        });
    });
});