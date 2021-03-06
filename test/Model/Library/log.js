suite("Log Library", function() {

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
    suite("| Log", function() {

        /**
         * Test case for log.
         *
         * @input x = log(5)
         * @expected Math.log(5) / Math.log(10)
         */
        test("| x = log(5)", function() {
            compiler.setUnits(false);
            var input = "x = log(5)";
            var output = compiler.compile(new script(input)).__x__();
            assert.equal(output, Math.log(5) / Math.log(10));
        });

        /**
         * Test case for log.
         *
         * @input x = 5
         *        y = log(x) + 2
         *        z = log(log(x) + log(y))
         * @expected z = Math.log(Math.log(5) / Math.log(10) + Math.log(Math.log(5) / Math.log(10) + 2) / Math.log(10))
         */
        test("| x = 5, y = log(x) + 2, z = log(log(x) + log(y))", function() {
            compiler.setUnits(false);
            var input =
                "x = 5\n" +
                "y = log(x) + 2\n" +
                "z = log(log(x) + log(y))";
            var output = compiler.compile(new script(input)).__z__();
            assert.equal(output, Math.log(Math.log(5) / Math.log(10) + Math.log(Math.log(5) / Math.log(10) + 2) / Math.log(10)) / Math.log(10));
        });

    });

});
