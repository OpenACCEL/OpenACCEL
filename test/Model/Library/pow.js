suite("Pow Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "Model/Compiler", "Model/Script"], function(Assert, Compiler, Script) {
            assert = Assert;
            compiler = new Compiler();
            script = Script;
            done();
        });
    });
    suite("| Pow", function() {

        /**
         * Test case for pow.
         *
         * @input pow(5,2)
         * @expected Math.pow(5, 2)
         */
        test("| x = pow(5, 2)", function() {
            compiler.setUnits(false);
            var input = "x = pow(5, 2)";
            var output = compiler.compile(new script(input)).__x__();
            assert.equal(output, Math.pow(5, 2));
        });

        /**
         * Test case for pow.
         *
         * @input pow(-2, 3)
         * @expected 8
         */
        test("| x = pow(-2, 3)", function() {
            compiler.setUnits(false);
            var input = "x = pow(-2, 3)";
            var output = compiler.compile(new script(input)).__x__();
            assert.equal(output, 8);
        });

        /**
         * Test case for pow.
         *
         * @input pow(-2, 0.5)
         * @expected Math.pow(2, 0.5)
         */
        test("| x = pow(-2, 0.5)", function() {
            compiler.setUnits(false);
            var input = "x = pow(-2, 0.5)";
            var output = compiler.compile(new script(input)).__x__();
            assert.equal(output, Math.pow(2, 0.5));
        });

        /**
         * Test case for pow.
         *
         * @input x = 5
         *        y = pow(x, 3)
         *        z = pow(y, pow(x, 2))
         * @expected Math.pow(Math.pow(5, 3), Math.pow(5, 2))
         */
        test("| x = 5; y = y = pow(x, 3);z = z = pow(y, pow(x, 2))", function() {
            compiler.setUnits(false);
            var input =
                "x = 5\n" +
                "y = pow(x, 3)\n" +
                "z = pow(y, pow(x, 2))";
            var output = compiler.compile(new script(input)).__z__();
            assert.equal(output, Math.pow(Math.pow(5, 3), Math.pow(5, 2)));
        });

    });
});
