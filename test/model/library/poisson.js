suite("Poisson Library", function() {

    var assert;
    var compiler;
    var macros;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader"], function(Assert, Compiler, FileLoader) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("poisson", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            fileLoader.load("factorial", "library");
            done();
        });
    });

    suite("poisson", function() {

        /**
         * Test case for poisson.
         *
         * @input poisson(3,4, false)
         * @expected 64 * Math.exp(-4) / 6
         */
        test("poisson function calculating the density.", function() {
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
        test("poisson function calculating the density.", function() {
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
        test("poisson function with variables less than 0", function() {
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
        test("poisson function with variables less than 0", function() {
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
});
