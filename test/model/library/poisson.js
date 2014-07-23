suite("Poisson Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("poisson", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            fileLoader.load("factorial", "library");
            script = Script;
            done();
        });
    });

    suite("| Poisson", function() {

        /**
         * Test case for poisson.
         *
         * @input poisson(3,4, false)
         * @expected 64 * Math.exp(-4) / 6
         */
        test("| Poisson function calculating the density.", function() {
            eval(fileLoader.getContent());
            var x = 3;
            var y = 4;
            var z = false;
            output = poisson(x, y, z);
            expected = 64 * Math.exp(-4) / 6;
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for poisson.
         *
         * @input poisson(3,4, true)
         * @expected 64 * Math.exp(-4) / 6 + 16 * Math.exp(-4) / 2 + 4 * Math.exp(-4) / 1 + 1 * Math.exp(-4) / 1
         */
        test("| Poisson function calculating the density.", function() {
            eval(fileLoader.getContent());
            var x = 3;
            var y = 4;
            var z = true;
            output = poisson(x, y, z);
            expected = 64 * Math.exp(-4) / 6 + 16 * Math.exp(-4) / 2 + 4 * Math.exp(-4) / 1 + 1 * Math.exp(-4) / 1;
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for poisson.
         *
         * @input poisson(-1,1, true)
         * @expected /The poisson of numbers less than 0 are not supported./
         */
        test("| Poisson function with variables less than 0", function() {
            eval(fileLoader.getContent());
            var x = -1;
            var y = 1;
            var z = true;
            expected = /The poisson of numbers less than 0 are not supported./;
            assert.throws(function() {
                poisson(x, y, z);
            }, expected);
        });

        /**
         * Test case for poisson.
         *
         * @input poisson(1,-1, false)
         * @expected /The poisson of numbers less than 0 are not supported./
         */
        test("| Poisson function with variables less than 0", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = -1;
            var z = false;
            expected = /The poisson of numbers less than 0 are not supported./;
            assert.throws(function() {
                poisson(x, y, z);
            }, expected);
        });
    });

    suite("| Units", function() {
        test("| Dimension", function() {
            compiler.loadUnitsLib();
            var input = 
            "a = 3; kg\n" +
            "b = 3\n" +
            "c = 4\n" +
            "d = 4; kg\n" +
            "e = true\n" +
            "f = true; kg\n" +
            "x = poisson(a, c, e)\n" +
            "y = poisson(b, d, e)\n" +
            "z = poisson(b, c, f)\n";
            var output = compiler.compile(new script(input));
            var expected = 64 * Math.exp(-4) / 6 + 16 * Math.exp(-4) / 2 + 4 * Math.exp(-4) / 1 + 1 * Math.exp(-4) / 1;
            output.setUnits(true);

            assert.ok(output.__x__().error);
            assert.ok(output.__y__().error);
            assert.ok(output.__z__().error);
            assert.equal(expected, output.__x__().value);
            assert.equal(expected, output.__y__().value);
            assert.equal(expected, output.__z__().value);
        });

        test("| Dimensionless", function() {
            compiler.loadUnitsLib();
            var input = 
            "a = 3\n" +
            "b = 4\n" +
            "c = true\n" +
            "x = poisson(a, b, c)\n";
            var output = compiler.compile(new script(input));
            var expected = 64 * Math.exp(-4) / 6 + 16 * Math.exp(-4) / 2 + 4 * Math.exp(-4) / 1 + 1 * Math.exp(-4) / 1;
            output.setUnits(true);

            assert.equal(expected, output.__x__().value);
            assert.equal(true, output.__x__().isNormal());
            assert.ifError(output.__x__().error);
        });
    });
});
